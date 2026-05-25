const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/Navbar.jsx', 'utf8');

const replacement = `
        {/* Left section: Logo */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-white tracking-wide leading-tight">INVERTIS</h1>
            <p className="text-[10px] text-[#A8DADC] tracking-widest uppercase leading-tight">University Bareilly</p>
          </div>
        </div>`;

content = content.replace(/\{\/\* Left section: Logo \*\/\}.*?<\/div>.*?<\/div>/s, replacement);

fs.writeFileSync('frontend/src/components/Navbar.jsx', content);
