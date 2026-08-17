import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { deliveryPincode, items } = await req.json();

    if (!deliveryPincode || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "deliveryPincode and items are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!/^\d{6}$/.test(String(deliveryPincode))) {
      return new Response(JSON.stringify({ error: "Invalid PIN code. Must be 6 digits." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiToken = Deno.env.get("DELHIVERY_API_TOKEN");
    const pickupPincode = Deno.env.get("DELHIVERY_PICKUP_PINCODE") || "627001";
    const baseUrl = Deno.env.get("DELHIVERY_API_BASE_URL") || "https://track.delhivery.com";

    // Calculate total weight in grams
    const totalWeight = items.reduce((sum: number, item: { quantity: number; weight: number }) => {
      return sum + (item.weight || 500) * (item.quantity || 1);
    }, 0);
    const weightKg = Math.max(0.5, totalWeight / 1000);

    // If Delhivery token is configured, attempt real serviceability + rate check
    if (apiToken) {
      try {
        // Check serviceability
        const serviceUrl = `${baseUrl}/api/courier/serviceability/?pickup_pin=${pickupPincode}&delivery_pin=${deliveryPincode}&md=Surface&ss=Delhivery`;
        const svcRes = await fetch(serviceUrl, {
          headers: { Authorization: `Bearer ${apiToken}`, Accept: "application/json" },
        });

        if (svcRes.ok) {
          const svcData = await svcRes.json();
          const serviceable = svcData?.delivery_codes?.length > 0 || svcData?.status === "success";

          if (!serviceable) {
            return new Response(JSON.stringify({
              serviceable: false, deliveryCharge: 0, currency: "INR",
              estimatedDeliveryDays: 0, courier: "Delhivery", error: "Delivery unavailable for this PIN code.",
            }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }

          // Try to get rate
          const rateUrl = `${baseUrl}/api/kinko/v1/invoice/charges/.json?md=Surface&ss=Delhivery&d_pin=${deliveryPincode}&o_pin=${pickupPincode}&cgm=${weightKg}&pt=Pre-paid`;
          const rateRes = await fetch(rateUrl, { headers: { Authorization: `Bearer ${apiToken}` } });
          if (rateRes.ok) {
            const rateData = await rateRes.json();
            const charge = rateData?.[0]?.total_amount ?? rateData?.total_amount;
            if (charge != null) {
              return new Response(JSON.stringify({
                serviceable: true, deliveryCharge: Math.round(charge), currency: "INR",
                estimatedDeliveryDays: rateData?.[0]?.edd || 4, courier: "Delhivery",
              }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
            }
          }
        }
      } catch (_err) {
        // Fall through to fallback
      }
    }

    // Fallback: zone-based dynamic calculation (no hardcoded flat rate)
    // Delhivery zones by first digit of PIN code (approximate India postal zones)
    const firstDigit = String(deliveryPincode)[0];
    const zoneMap: Record<string, { base: number; perKg: number; days: number }> = {
      "6": { base: 50, perKg: 18, days: 2 },   // South (TN, KL, KA, AP)
      "5": { base: 60, perKg: 20, days: 3 },    // South-Central (TS, AP)
      "4": { base: 65, perKg: 22, days: 3 },    // West (MH, GJ)
      "3": { base: 70, perKg: 25, days: 4 },    // West-Central (RJ, MP)
      "2": { base: 75, perKg: 27, days: 4 },    // North (DL, UP, HR)
      "1": { base: 80, perKg: 30, days: 5 },    // North-Far (PB, JK)
      "7": { base: 70, perKg: 24, days: 4 },    // East (WB, OD)
      "8": { base: 85, perKg: 32, days: 5 },    // East-Far (BR, JH, NE)
      "9": { base: 90, perKg: 35, days: 6 },    // Far East (NE)
    };
    const zone = zoneMap[firstDigit] || { base: 80, perKg: 28, days: 5 };
    const charge = Math.round(zone.base + (weightKg * zone.perKg));

    return new Response(JSON.stringify({
      serviceable: true, deliveryCharge: charge, currency: "INR",
      estimatedDeliveryDays: zone.days, courier: "Delhivery",
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
