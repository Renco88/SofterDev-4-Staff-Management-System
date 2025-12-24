import { Link } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout.jsx'

export default function Home() {
  return (
    <AppLayout>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-white border shadow-sm">
        <div className="p-8 sm:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src="/logo.png"
              onError={(e) => { e.currentTarget.src = '/vite.svg' }}
              alt="KKBAU Logo"
              className="h-20 w-20 md:h-24 md:w-24 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
                খুলনা খান বাহাদুর আহসানুল্লাহ ইউনিভার্সিটি (KKBAU)
              </h1>
              <p className="mt-2 text-gray-600 text-sm md:text-base">
                জ্ঞান, সততা ও উদ্ভাবনের মাধ্যমে ভবিষ্যৎ গড়ে তোলার অঙ্গীকার।
                আধুনিক সুবিধা, দক্ষ শিক্ষক মণ্ডলী এবং গবেষণা‑মুখী শিক্ষাব্যবস্থার একটি প্রাণবন্ত ক্যাম্পাস।
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                >
                  Login
                </Link>
                <a href="#about" className="text-sm text-gray-700 hover:text-gray-900">About</a>
                <a href="#departments" className="text-sm text-gray-700 hover:text-gray-900">Departments</a>
                <a href="#contact" className="text-sm text-gray-700 hover:text-gray-900">Contact</a>
                <a href="https://www.kkbau.ac.bd/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:text-gray-900">Official Website</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mt-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">About KKBAU</h2>
          <p className="mt-2 text-gray-600">
            খুলনা খান বাহাদুর আহসানুল্লাহ ইউনিভার্সিটি একটি সরকার ও ইউজিসি অনুমোদিত বেসরকারি বিশ্ববিদ্যালয়।
            নৈতিকতা, উৎকর্ষতা ও উদ্ভাবনকে মূল্য দিয়ে আমরা শিক্ষার্থীদেরকে বিশ্বমানের শিক্ষা প্রদান করি।
          </p>
        </div>
      </section>

      {/* Departments */}
      <section id="departments" className="mt-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">Programs & Departments</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {['CSE','EEE','BBA','English','ISLM'].map((d) => (
              <div key={d} className="rounded-xl border bg-gray-50 p-4">
                <div className="font-semibold text-gray-800">{d}</div>
                <div className="text-sm text-gray-600">প্রতিটি বিভাগে অভিজ্ঞ শিক্ষক ও আধুনিক ল্যাব সুবিধা।</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mt-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">Contact</h2>
          <p className="mt-2 text-gray-600">ই‑মেইল: ictcell@kkbau.ac.bd , info@kkbau.ac.bd , · ফোন: +8801409-977688,
+8801409-977689</p>
        </div>
      </section>
    </AppLayout>
  )
}