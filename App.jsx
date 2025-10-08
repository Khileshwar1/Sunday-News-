import React, { useState, useEffect } from 'react';
export default function App() {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [articles, setArticles] = useState(sampleArticles);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  const categories = ['All','National','International','Business','Technology','Sports','Entertainment','Religion','Agriculture','Health'];
  function filtered() {
    return articles.filter(a => {
      const matchesCategory = category==='All'||a.category===category;
      const matchesQuery = [a.title,a.excerpt,a.author].join(' ').toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }
  const top = filtered();
  const featured = top[0]||sampleArticles[0];
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4"><h1 className="text-xl font-bold">My Blog News</h1></div>
        <button onClick={()=>setDark(d=>!d)} className="px-3 py-2 bg-gray-200 dark:bg-gray-800 rounded-md">{dark?'🌙 Dark':'☀️ Light'}</button>
      </header>
      <main className="max-w-6xl mx-auto px-4">
        <section className="mb-6 flex gap-2 flex-wrap">
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search..." className="flex-1 p-2 border rounded-md"/>
          {categories.map(cat=>(<button key={cat} onClick={()=>setCategory(cat)} className={`px-3 py-1 rounded-full ${category===cat?'bg-indigo-600 text-white':'bg-gray-200 dark:bg-gray-800'}`}>{cat}</button>))}
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <article className="lg:col-span-2 rounded-xl overflow-hidden shadow bg-white dark:bg-gray-800">
            <img src={featured.image} alt={featured.title} className="w-full h-64 object-cover"/>
            <div className="p-6">
              <div className="text-sm opacity-80 mb-2">{featured.category} • {featured.date}</div>
              <h2 className="text-2xl font-bold mb-2">{featured.title}</h2>
              <p className="mb-4 line-clamp-3">{featured.excerpt}</p>
              <div className="flex items-center justify-between"><div className="text-sm opacity-80">By {featured.author}</div><a href="#" className="text-indigo-600">Read full →</a></div>
            </div>
          </article>
        </section>
      </main>
      <footer className="mt-8 border-t border-gray-200 dark:border-gray-800 text-center py-4 text-xs opacity-70">© {new Date().getFullYear()} My Blog News</footer>
    </div>
  );
}
const sampleArticles=[{id:'a1',title:'रोज़गार और खेती: नए अवसर 2025 में',excerpt:'किसानों के लिए नए सरकारी योजनाओं और बाजार के रुझानों का संक्षेप।',category:'Agriculture',author:'खिलेश्वर राठिया',date:'Oct 7, 2025',image:'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=60'}];
