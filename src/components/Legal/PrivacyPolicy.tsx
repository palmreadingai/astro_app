import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Privacy Policy</h1>
          
          <div className="space-y-8 text-purple-100">
            <p className="leading-relaxed">
              Welcome to palmai.live. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
            </p>
            <div className="ml-4">
              <section>
                <h3 className="text-xl font-semibold text-white mt-4">1. Confidentiality</h3>
                <p className="leading-relaxed">
                  Palmai.live guarantees confidentiality of our members' identity, birth details and any forecasts made using those details as much possible under legal regulatory and security environment.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-semibold text-white mt-4">2. Use of Information</h3>
                <p className="leading-relaxed">
                  We use the information we collect to provide, personalize, and improve our services. This includes using your data to generate horoscope charts and predictions, as well as for internal purposes such as data analysis, research, and to improve our algorithms and service offerings. We may also use your information to communicate with you about our services, including updates and promotional offers.
                </p>
              </section>
              
              <section>
                <h3 className="text-xl font-semibold text-white mt-4">3. Information Sharing</h3>
                <p className="leading-relaxed">
                  We do not sell or rent user’s personally identifiable information to anyone.
                </p>
              </section>
            </div>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">DATA PRIVACY</h2>
              <div className="ml-4">
                <section>
                  <h3 className="text-xl font-semibold text-white mt-4">1. Data Collection</h3>
                  <p className="leading-relaxed">
                    During registration, Palmai.live collects personal details like name, gender, birth info, email, phone number, and place of birth to generate accurate horoscopes. Your email or phone, along with a password, secures your profile and enables personalized communication services.
                  </p>
                </section>
                <section>
                  <h3 className="text-xl font-semibold text-white mt-4">2. Image Collection</h3>
                  <p className="leading-relaxed">
                    Palmai.live also collects users' palm images for palm line predictions.
                  </p>
                </section>
                <section>
                  <h3 className="text-xl font-semibold text-white mt-4">3. Non-Personal Data</h3>
                  <p className="leading-relaxed">
                    Palmai.live and its service partners may collect non-personal data like IP address, browser type, screen resolution, and time spent on the site to analyze user behavior and demographics. This helps us diagnose issues, improve site performance, and enhance user experience.
                  </p>
                </section>
                <section>
                  <h3 className="text-xl font-semibold text-white mt-4">4. Additional Information</h3>
                  <p className="leading-relaxed">
                    Any additional information that palmai.live receive via email or other communication channels regarding specific services or products is generally not included in your member profile. It is used solely to respond to the particular query or concern you have shared with us.
                  </p>
                </section>
                <section>
                  <h3 className="text-xl font-semibold text-white mt-4">5. Payment Information</h3>
                  <p className="leading-relaxed">
                    We do not collect any payment details directly on our website. All payment information is securely handled by trusted third-party payment gateways. We adhere to standard industry practices, employing technical and procedural safeguards to protect your information from unauthorized access or misuse.
                  </p>
                </section>
                
                <section>
                  <h3 className="text-xl font-semibold text-white mt-4">6. External Links</h3>
                  <p className="leading-relaxed">
                    Palmai.live holds no responsibility for the privacy policies of external sites linked through its platform.
                  </p>
                </section>
              </div>
            </section>
            <p className="leading-relaxed">
              Palmai.live may update its Privacy Policy as new services are added. Users are encouraged to review this page periodically. Continued use of the site implies acceptance of any policy changes.
            </p>

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