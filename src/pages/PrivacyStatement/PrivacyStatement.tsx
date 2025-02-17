

const PrivacyStatement = () => {
  return (
    <div className="max-h-[85vh] items-center text-neutral-200 bg-neutral-900 p-6 my-16 overflow-y-auto">
      <div className="max-w-3xl mx-auto bg-neutral-800 shadow-lg rounded-lg p-8">
        <h1 className="text-3xl text-indigo-500 font-bold mb-4">Privacy Statement</h1>
        <p className="mb-4">
          This Privacy Statement explains how GenPass, our password generator, manages and protects your privacy. We value your trust and are committed to safeguarding any personal information you may provide while using the application.
        </p>
        <h2 className="text-2xl text-indigo-500 font-semibold mb-3">About the Password Generator</h2>
        <p className="mb-4">
          GenPass is a secure password generator designed to help you create strong, random passwords for your online accounts. The generator operates entirely on your device, ensuring that your input and generated passwords remain private. No password or personal information is transmitted to or stored on any remote server.
        </p>
        <h2 className="text-2xl text-indigo-500 font-semibold mb-3">Data and Local Storage</h2>
        <p className="mb-4">
          GenPass uses your browser's local storage only to save non-sensitive user preferences, such as your selected options for password generation. These settings help improve your user experience by preserving your favorite configurations. All data stored locally remains on your device and is never shared or accessed by third parties.
        </p>
        <h2 className="text-2xl text-indigo-500 font-semibold mb-3">Privacy and Security</h2>
        <p className="mb-4">
          We designed GenPass with security and privacy in mind. The password generation process happens in your browser, preventing any of your data from being exposed or intercepted in transit. We do not implement tracking cookies, analytics, or collect any personal data beyond what is stored locally for user convenience.
        </p>
        <h2 className="text-2xl text-indigo-500 font-semibold mb-3">Your Consent and Control</h2>
        <p className="mb-4">
          By using GenPass, you acknowledge that you understand how your data is handled and consent to the use of local storage for saving your password generation settings. If you prefer, you can clear your browser's local storage at any time to remove these settings.
        </p>
        <h2 className="text-2xl text-indigo-500 font-semibold mb-3">Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Statement or the way GenPass handles your data, please feel free to reach out to us.
        </p>
      </div>
    </div>
  );
};

export default PrivacyStatement;