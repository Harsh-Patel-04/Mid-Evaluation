import Navbar from "../components/CitizenNavbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <Navbar />

      <header className="bg-gray-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 h-full">
          <div className="flex-1 space-y-6 md:pr-12">
            <h1 className="text-4xl md:text-5xl font-bold">CrimeRadar</h1>
            <h2 className="text-2xl md:text-3xl font-semibold">
              Make Your Community Safer Together
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl">
              Report and track incidents in your area with our interactive
              map-based platform. Help create a safer community through
              real-time reporting and awareness.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-medium transition-colors"
                onClick={() => navigate("/login")}
              >
                Report Incident
              </button>
              <button
                className="bg-gray-800 hover:bg-gray-700 px-8 py-3 rounded-lg font-medium transition-colors"
                onClick={() => navigate("/login")}
              >
                View Map
              </button>
            </div>
          </div>

          <div className="flex-1 w-full h-full">
            <img
              src="/images/map.jpg"
              alt="Community safety illustration"
              className="w-full h-full object-cover rounded-xl shadow-xl"
              loading="lazy"
            />
          </div>
        </div>
      </header>
<section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
  <div className="flex justify-center">
      <img
        src="../../images/Flux_Dev_A_realistic_laptop_on_a_desk_with_the_screen_displayi_0 (1).jpg"
        alt="Laptop showing map-based app"
        className="w-full max-w-lg rounded-2xl shadow-2xl"
        loading="lazy"
      />
    </div>
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">
        Visualize Incidents in Real-Time
      </h2>
      <p className="text-lg text-gray-600">
        Our interactive map allows users to report and explore incidents
        across the community. Just click on the map to select a location, 
        add your details, and submit.
      </p>
      <ul className="space-y-2 text-gray-700">
        <li>Drop pins to report exact locations</li>
        <li>Fill quick forms to describe incidents</li>
        <li>Attach images or evidence securely</li>
        <li>Filter and browse reports in your area</li>
      </ul>
      <button
        className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        onClick={() => navigate("/login")}
      >
        Try the Map
      </button>
    </div>
   
  </div>
</section>


      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl">
              <h4 className="text-xl font-semibold mb-4 text-center">
                Interactive Map
              </h4>
              <p className="text-gray-600 text-center">
                View and report incidents on our interactive map with real-time
                updates and filtering options.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <h4 className="text-xl font-semibold mb-4 text-center">
                Quick Reporting
              </h4>
              <p className="text-gray-600 text-center">
                Easy-to-use incident reporting system with photo upload and
                location tagging.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <h4 className="text-xl font-semibold mb-4 text-center">
                Mobile Friendly
              </h4>
              <p className="text-gray-600 text-center">
                Access the platform on any device with our responsive
                mobile-first design.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-gray-900 rounded-2xl overflow-hidden">
          <div className="px-6 py-12 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to make your community safer?
            </h2>
            <p className="mt-4 text-lg text-white">
              Join thousands of citizens helping to create safer neighborhoods.
            </p>
            <button
              className="mt-8 bg-blue-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-blue-700 transition"
              onClick={() => navigate("/login")}
            >
              Get Started Now
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;

