import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PricingPolicy() {
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
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Pricing Policy</h1>
          
          <div className="space-y-8 text-purple-100">
            <section>
              <h3 className="text-xl font-semibold text-white mb-4">1. Payment Methods</h3>
              <p className="leading-relaxed">
                Palmai.live accepts payment through online mode only. Any online transaction (debit card/credit card/UPI/internet banking etc.) on palmai.live is secured and encrypted through trusted third party payment gateway.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-4">2. Accepted Payment Methods and Currency</h3>
              <p className="leading-relaxed">
                Palmai.live accepts all major credit cards, debit cards, and digital payment methods. Prices are displayed in Indian Rupees for Indian users and in US Dollars for International users.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-4">3. Pricing Structure</h3>
              <p className="leading-relaxed">
                The amount of purchase of any paid services on palmai.live is based on the subscription plan that the user opts. The exact price is indicated to user before making payment.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-4">4. One-Time Payment Services</h3>
              <p className="leading-relaxed mb-4">
                <strong>Palm AI operates on a simple one-time payment model for its services including:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed pl-4">
                <li>AI-powered palm reading analysis</li>
                <li>Personalized AI supported astrology consultation and guidance</li>
                <li>Detailed Kundali reports and insights</li>
                <li>All future service updates and improvements</li>
                <li>Customer support</li>
                <li>Any other services as decided by the competent authorities of palmai.live</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-4">5. Recurring Payment Services</h3>
              <p className="leading-relaxed mb-4">
                <strong>Some of the services of palmai.live are available on recurring payment models which includes:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed pl-4">
                <li>Daily Horoscope</li>
                <li>AI based daily solutions and guidance based on user's daily horoscope</li>
                <li>AI chats beyond prescribed limits</li>
                <li>Any other services as decided by the competent authorities of palmai.live</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-4">6. Refund Policy</h3>
              <p className="leading-relaxed">
                For information about refunds, please refer to our separate Refund Policy document, which outlines the terms and conditions for refund requests.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-white mb-4">7. Contact Information</h3>
              <p className="leading-relaxed">
                If you have any questions about our pricing or payment process, please contact us at support@palmai.live.
              </p>
            </section>

            <div className="border-t border-white/20 pt-6 mt-8">
              <p className="text-center text-purple-200">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}