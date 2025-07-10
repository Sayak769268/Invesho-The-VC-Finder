# 🚀 Invesho — The VC Finder

**Invesho** is a modern, AI-inspired web platform that helps startup founders and entrepreneurs discover venture capital (VC) firms by industry, stage, geography, and more. Designed with a focus on usability, speed, and clean design, the app showcases best practices in React development and responsive web design.

🔗 **Live Demo**: [inveshovcfinder.netlify.app](https://inveshovcfinder.netlify.app)

---

## ✨ Features

### 🔍 Find VCs by Industry

* Explore venture capital firms across major sectors like **Fintech**, **SaaS**, **AI**, etc.
* Use the "Other" option with **smart autosuggest** for niche domains like **AgriTech**, **FoodTech**, **SpaceTech**, and more.

### 📊 Realistic, Curated VC Data

* Contains a **hand-curated dataset** of Indian and global VC firms.
* Covers various industries, funding stages, and geographies.

### 🎯 Advanced Filtering

* Filter by **investment stage**, **country**, and **investment range**.
* Sidebar filters on desktop and a responsive **drawer** on mobile.

### ⭐ Favorites (Shortlist)

* Save favorite VCs to your **shortlist** for later reference.
* Persistence handled through `localStorage`.

### 🕒 Recently Viewed

* Keep track of recently viewed VCs.
* Revisit them quickly from a dedicated page.

### 🧾 VC Detail Modal

* View rich details about each VC:

  * Website and email
  * Notable investments
  * Personal notes field (for shortlisted VCs)

### 💻 Responsive & Polished UI

* Fully **mobile-friendly**
* Includes:

  * Sticky header
  * Scroll-to-top button
  * Glassmorphism UI
  * Smooth light/dark mode transitions

### 🧠 UX Enhancements

* Loading spinners and error messages
* Results summary and active filters display
* Tooltips, hover effects, accessible buttons and forms

---

## 🛠️ Tech Stack

* **Frontend**: React (via [Vite](https://vitejs.dev))
* **Styling**: Custom CSS (with gradients, frosted-glass, and Unsplash backgrounds)
* **Data Source**: Static `firms.json` file
* **State Management**: React hooks and browser `localStorage`

---

## 📱 Mobile-First & Accessibility

* Responsive design for all screen sizes
* Touch-friendly filtering
* Accessible color schemes and keyboard navigation

---

## ⚙️ Getting Started

```bash
# Clone the repository
git clone https://github.com/Sayak769268/Invesho-The-VC-Finder.git

# Install dependencies
npm install

# Run the development server
npm run dev

# Open in browser
http://localhost:5173
```

---

## 🙏 Credits

* Developed by **Sayak Mukherjee**
* Background images from [Unsplash](https://unsplash.com/)
* VC dataset (`firms.json`) curated for demonstration purposes

---

## 📄 License

This project is open for educational and demonstration use.

---
