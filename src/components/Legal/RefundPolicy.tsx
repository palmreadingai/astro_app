import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RefundPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-purple-200 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Refund Policy</h1>
          
          <div class="space-y-8 text-purple-100">
            <section>
              <h2 class="text-2xl font-semibold text-white mb-4">1. Refund Eligibility</h2>
              <p class="leading-relaxed">
                Full refund will be initiated in case the amount is deducted from the user but the service or subscription for which the amount was deducted; it is not activated for the user.
              </p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-white mb-4">2. Double Payment</h2>
              <p class="leading-relaxed">
                In case of double payment made by mistake against the single order, one payment will be refunded.
              </p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-white mb-4">3. Service Subscription</h2>
              <p class="leading-relaxed">
                Once any service is subscribed by the user and the amount for the service is paid, no refund shall be initiated in any case even if the service is not availed by the user.
              </p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-white mb-4">4. Recurring Payments</h2>
              <p class="leading-relaxed">
                All recurring payments shall be made as per the guidelines of banks, payment gateways and user authentication. The same shall not be eligible for refund once payment is processed and service is activated.
              </p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-white mb-4">5. Refund Timeline</h2>
              <p class="leading-relaxed">
                All eligible refunds shall be made within seven business days from the date of receipt of request. However, the same is subject to transaction and processing time taken by bank/payment gateway.
              </p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-white mb-4">6. Deductions</h2>
              <p class="leading-relaxed">
                All refunds will be made after deducting the transaction charges levied by the bank and / or the payment gateway, or any other charges that may have been borne by palmlive.ai in processing and / or delivering the service, as applicable.
              </p>
            </section>

            <section>
              <h2 class="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
              <p class="leading-relaxed">
                Contact our support team at support@palmai.com for refund related queries.
              </p>
            </section>

            <div class="border-t border-white/20 pt-6 mt-8">
              <p class="text-center text-purple-200">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}