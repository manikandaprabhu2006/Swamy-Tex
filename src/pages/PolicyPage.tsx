import SEO from "@/components/SEO";

const POLICIES: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: "Privacy Policy",
    sections: [
      { heading: "Information We Collect", body: "We collect information you provide directly to us — such as your name, email, phone number, shipping address, and payment details when you create an account or place an order. We also collect usage data like browsing activity on our website." },
      { heading: "How We Use Your Information", body: "We use your information to process and ship your orders, communicate with you about your purchases, provide customer support, improve our products and services, and send you marketing communications (which you can opt out of at any time)." },
      { heading: "Information Sharing", body: "We do not sell your personal information. We share data only with trusted partners necessary to fulfill your order — Razorpay for payment processing and Delhivery for shipping. All partners are bound by strict confidentiality obligations." },
      { heading: "Data Security", body: "We implement industry-standard security measures including encrypted connections (HTTPS), secure password hashing, and row-level database access controls to protect your information from unauthorized access." },
      { heading: "Your Rights", body: "You have the right to access, correct, or delete your personal information. You can update your profile and addresses from your account, or contact us at care@swamytex.in for assistance." },
      { heading: "Cookies", body: "We use cookies to maintain your session, remember your theme preference, and improve your browsing experience. You can disable cookies in your browser settings, though some features may not function properly." },
    ],
  },
  terms: {
    title: "Terms of Service",
    sections: [
      { heading: "Acceptance of Terms", body: "By accessing and using the SWAMY TEX website, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our website." },
      { heading: "Products & Pricing", body: "All products are subject to availability. We reserve the right to modify or discontinue products at any time. Prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to correct pricing errors." },
      { heading: "Orders & Payments", body: "When you place an order, you authorize us to charge your payment method via Razorpay. All payments are processed securely. Order acceptance is subject to product availability and payment verification." },
      { heading: "Shipping & Delivery", body: "Orders are shipped via Delhivery across India. Delivery charges are calculated dynamically based on your PIN code, order weight, and package dimensions. Estimated delivery times are provided at checkout." },
      { heading: "Returns & Refunds", body: "Please refer to our Refund Policy for details on return eligibility, timeframes, and refund processing." },
      { heading: "Limitation of Liability", body: "SWAMY TEX shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our maximum liability is limited to the amount paid for the relevant order." },
    ],
  },
  shipping: {
    title: "Shipping Policy",
    sections: [
      { heading: "Delivery Partner", body: "We ship exclusively through Delhivery, ensuring reliable and trackable delivery across India. No other courier services are used." },
      { heading: "Delivery Charges", body: "Delivery charges are calculated dynamically based on your delivery PIN code, the total weight of your order, and package dimensions. Charges are not hardcoded — they reflect real Delhivery serviceability and rate data. You'll see the exact delivery charge at checkout before making payment." },
      { heading: "Serviceability", body: "Before placing your order, you can check if Delhivery delivers to your PIN code. If a location is not serviceable, you will be notified and payment will not be processed." },
      { heading: "Estimated Delivery Time", body: "Most orders are delivered within 3-7 business days depending on your location. You'll receive an estimated delivery date at checkout and can track your shipment in real time using your order number." },
      { heading: "Order Tracking", body: "Once your order is shipped, you'll receive a tracking number. You can track your order anytime from the Track Order page on our website." },
    ],
  },
  refund: {
    title: "Refund & Return Policy",
    sections: [
      { heading: "Return Eligibility", body: "We accept returns within 7 days of delivery for unworn, unwashed items with original tags and packaging. Certain items (innerwear, accessories, sale items) are non-returnable for hygiene and inventory reasons." },
      { heading: "How to Initiate a Return", body: "To request a return, contact us at care@swamytex.in with your order number and reason for return. We will guide you through the return process and provide pickup details via Delhivery where applicable." },
      { heading: "Refund Processing", body: "Once we receive and inspect the returned item, your refund will be processed to the original payment method within 5-7 business days. You'll receive a confirmation email when the refund is initiated." },
      { heading: "Cancellations", body: "You can cancel your order before it is shipped. If cancellation occurs after shipping, the order will be treated as a return upon delivery. Refunds for cancelled orders are processed to the original payment method." },
      { heading: "Damaged or Incorrect Items", body: "If you receive a damaged or incorrect item, please contact us within 48 hours of delivery with photos. We will arrange a replacement or full refund at no cost to you." },
    ],
  },
};

export default function PolicyPage({ kind }: { kind: keyof typeof POLICIES }) {
  const policy = POLICIES[kind];
  return (
    <>
      <SEO title={policy.title} description={`${policy.title} for SWAMY TEX.`} canonical={`/${kind === "privacy" ? "privacy-policy" : kind === "terms" ? "terms" : kind === "shipping" ? "shipping-policy" : "refund-policy"}`} />
      <div className="pt-20 lg:pt-24">
        <div className="border-b border-line bg-bg-secondary">
          <div className="container-edge py-10">
            <p className="section-eyebrow mb-2">Legal</p>
            <h1 className="font-display text-4xl font-light text-ink-primary lg:text-5xl">{policy.title}</h1>
          </div>
        </div>
        <div className="container-edge py-16">
          <div className="max-w-3xl space-y-8">
            {policy.sections.map((s) => (
              <div key={s.heading}>
                <h2 className="mb-3 font-display text-xl text-gold">{s.heading}</h2>
                <p className="text-sm leading-relaxed text-ink-secondary">{s.body}</p>
              </div>
            ))}
            <div className="border-t border-line pt-6 text-xs text-ink-secondary">
              <p>Last updated: August 2026 · SWAMY TEX · Tirunelveli, Tamil Nadu, India</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
