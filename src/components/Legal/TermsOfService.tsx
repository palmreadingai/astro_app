import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Terms of Service</h1>
          
          <div className="space-y-8 text-purple-100">
            <p className="leading-relaxed">
              By using or accessing the services provided by PALMAI.LIVE (palmai.live referred hereafter to website & mobile application of palmai.live and competent authorities of palmai.live including any third party agent associated with service delivery of palmai.live ) either by website or its mobile application , user (user hereafter referred to any living person who access the services of palmai.live after registration) agree to be bound by the Terms and Conditions mentioned below-
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Description of Services provided by palmai.live</h2>
              <p className="leading-relaxed">
                palmai.live is a digital platform that offers a wide range of Artificial Intelligence(AI) based astrology-related content and services. These includes but not limited to palm reading, astrological horoscopes, personalized reports, planetary data, birth chart analysis, Kundali etc. along with AI consultations.
              </p>
              <p className="leading-relaxed mt-4">
                A portion of this content is available to all users free of charge after registering and creating account on palmai.live website or its mobile application, hereafter referred Free Services. However, to unlock access to more detailed, personalized astrological insights and premium offerings — such as tailored horoscope readings, in-depth compatibility reports, and live AI consultations, user need to pay the amount as decided by the competent authorities of palmai.live and hereafter referred as Paid Services.
              </p>
              <p className="leading-relaxed mt-4">
                Together, the Free Services and Paid Services are referred to collectively as the “Services.” These Services are designed to provide users with astrological guidance and insights based on astrological literatures as predicted by Artificial Intelligence. This may be considered for entertainment and informational purposes only and any adherence or action taken based on the reports, predictions or any services of palmai.live shall be at complete responsibility of user and palmai.live shall not be held responsible in any manner.
              </p>
              <p className="leading-relaxed mt-4">
                Further palmai.live shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses of the user.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">While using the Services of palmai.live, user agrees to:</h2>
              <section>
                <h3 className="text-xl font-semibold text-white mt-4">1. USER DATA</h3>
                <p className="leading-relaxed">
                  Provide, maintain and update the accurate information about the user as prompted in palmai.live. User also gives the consent to palmai.live to use their data in order to provide the services.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-white mt-4">2. REGISTRATION</h3>
                <p className="leading-relaxed">
                  The registration on palmai.live is completed through user’s personal E-MAIL ID authenticated through verification mail and secured through user’s password. Users are entirely responsible to maintain the confidentiality of their registration through EMAIL ID and password. Users can change the password by following instructions as available on the website of palmai.live. Users also agree that their account, EMAIL ID, and password may not be transferred or sold to another party.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-white mt-4">3. USAGE</h3>
                <p className="leading-relaxed">
                  Users are entirely responsible for all uses of their account, whether or not actually or expressly authorized by them. These services must not be used for any unlawful purposes.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-white mt-4">4. ELIGIBILITY</h3>
                <p className="leading-relaxed">
                  The Services are available only to individuals who are at least 18 years old.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-white mt-4">5. NATIONALITY</h3>
                <p className="leading-relaxed">
                  Palmai.live restricts use of its Services by individuals in regions where such services are prohibited or in countries barred from trade with India due to laws, regulations, or treaties.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-white mt-4">6. TERMINATION</h3>
                <p className="leading-relaxed">
                  Palmai.live reserve the right to terminate the account or services (in whole or part) of any user immediately with or without notice.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-white mt-4">7. PRIVACY POLICY</h3>
                <p className="leading-relaxed">
                  We respect your privacy and are committed to protecting your personal information. Please refer to our Privacy Policy available on website for details on how we collect, use, and protect your data.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-white mt-4">8. PAYMENT</h3>
                <p className="leading-relaxed">
                  All payments are processed securely through our  trusted payment partners offering variety of online payment mode including UPI. Debit, Credit Card etc. The amount is charged according to the selected subscription plan of user and any recurring payment (if any) can be cancelled at any time.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-white mt-4">9. REFUND</h3>
                <p className="leading-relaxed">
                  Refunds are subject to our Refund Policy mentioned on website.
                </p>
              </section>
            </section>
            
            <section>
                <p className="leading-relaxed">
                Palmai.live reserves the right to modify, update, or revise these Terms of Service at any time, at its sole discretion. Any changes made to the Terms will be posted on the website, and such modifications shall take effect on user immediately upon posting unless stated otherwise. By continuing to access or use palmai.live after the updated Terms have been posted, user acknowledge and agree to be bound by the revised Terms. It is the responsibility of user to regularly visit and review the website of palmai.live to stay informed about any changes. If you do not agree to the amended Terms, you must discontinue use of the Services.
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