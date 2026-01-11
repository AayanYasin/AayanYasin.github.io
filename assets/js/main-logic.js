// --- 1. Animated Particle Background ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let animationId;
const particles = [];
const particleCount = 80;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.fill();
    }
}

// Initialize particles once
for (let i = 0; i < particleCount; i++) particles.push(new Particle());

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p1, i) => {
        p1.update();
        p1.draw();
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 - distance / 1000})`;
                ctx.lineWidth = 1;
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });
    animationId = requestAnimationFrame(animate);
}

// TOP TIER: Only animate when the hero is in view
const bgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) animate();
        else cancelAnimationFrame(animationId);
    });
}, { threshold: 0.1 });

bgObserver.observe(document.getElementById('home'));


// --- Corrected Tag Gallery Logic ---
function openGalleryByTag(tag) {
    const galleryItems = [];
    
    // 1. Gather all matching items
    Object.keys(projectData).forEach(catKey => {
        const category = projectData[catKey];
        if (tag === 'All' || category.tags.includes(tag)) {
            category.items.forEach((item, index) => {
                galleryItems.push({
                    ...item,
                    categoryKey: catKey,
                    itemIndex: index,
                    categoryTags: category.tags
                });
            });
        }
    });

    // 2. Update UI
    // Inside openGalleryByTag(tag)...
    const titleEl = document.getElementById('galleryTitle');
    const tagEl = document.getElementById('galleryTag');

    titleEl.innerText = tag === 'All' ? "All Projects" : `Topic: ${tag}`;
    // Ensure this always renders as a pill even if 'All' is selected
    tagEl.innerHTML = `<span class="tag-pill">${tag === 'All' ? "Full Portfolio" : tag}</span>`;
        
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = galleryItems.map(item => `
        <div class="gallery-item" onclick="openProjectPage('${item.categoryKey}', ${item.itemIndex})">
            <div class="gallery-img-container">
                <img src="${item.images[0]}" alt="${item.title}" onerror="this.src='https://placehold.co/400x250?text=Preview'">
                <div class="img-overlay-text">View Project</div>
            </div>
            <div class="gallery-info">
                <h4>${item.title}</h4>
                <p>${item.desc}</p>
                <div class="project-tag" style="margin-top: 12px; gap: 4px;">
                    ${item.categoryTags.slice(0,3).map(t => `<span class="tag-pill" style="font-size: 9px; padding: 2px 8px;">${t}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // 3. Open Overlay
    const overlay = document.getElementById('galleryOverlay');
    overlay.style.display = 'block';
    setTimeout(() => {
        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
    }, 10);
}

function renderGalleryItems(items, categoryKey = null) {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = items.map((item, index) => {
        // Handle both direct category items and filtered tag items
        const catKey = categoryKey || item.categoryKey;
        const itemIdx = item.itemIndex !== undefined ? item.itemIndex : index;
        
        return `
            <div class="gallery-item" onclick="openProjectPage('${catKey}', ${itemIdx})">
                <div class="gallery-img-container">
                    <img src="${item.images[0]}" alt="${item.title}" loading="lazy" 
                         onerror="this.src='https://placehold.co/600x400/1a1a24/60a5fa?text=Preview+Coming+Soon'">
                    <div class="img-overlay-text">Explore Case Study</div>
                </div>
                <div class="gallery-info">
                    <h4>${item.title}</h4>
                    <p>${item.desc}</p>
                    <div class="project-tag" style="margin-top: auto; padding-top: 1rem;">
                        ${item.categoryTags ? item.categoryTags.map(t => `<span class="tag-pill" style="font-size: 10px;">${t}</span>`).join('') : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// --- 2. Scroll Reveal Animation ---
const observerOptions = { threshold: 0.1 };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// --- 3. Navbar Scroll Effect ---
window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// 4. Update Gallery with Bullet style
function openGallery(cat) {
    const data = projectData[cat];
    if(!data) return;

    const grid = document.getElementById('galleryGrid');
    const titleEl = document.getElementById('galleryTitle');
    const tagEl = document.getElementById('galleryTag');

    titleEl.innerText = data.title;
    tagEl.innerHTML = data.tags.map(t => `<span class="tag-pill">${t}</span>`).join('');

    // --- NEW LOGIC START ---
    if (data.items.length === 0) {
        grid.innerHTML = `
            <div class="coming-soon-container" style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; background: var(--surface); border-radius: 20px; border: 1px dashed var(--accent);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🚧</div>
                <h3 style="color: var(--text); margin-bottom: 0.5rem;">Project Upload in Progress</h3>
                <p style="color: var(--text-dim);">I'm currently documentation this project. Check back soon for the full case study!</p>
            </div>
        `;
    } else {
        renderGalleryItems(data.items, cat);
    }
    // --- NEW LOGIC END ---

    const overlay = document.getElementById('galleryOverlay');
    overlay.style.display = 'block';
    requestAnimationFrame(() => {
        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
    });
}

function closeGallery() {
    const overlay = document.getElementById('galleryOverlay');
    overlay.classList.remove('active');
    setTimeout(() => overlay.style.display = 'none', 400);
    document.body.classList.remove('no-scroll');
}

window.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeGallery(); });

// --- 5. Project Page Overlay Functionality ---
let currentSlideIndex = 0;
let totalSlides = 0;

function openProjectPage(category, itemIndex) {
    const project = projectData[category].items[itemIndex];
    const categoryData = projectData[category];

    // 1. Center the pill and Title
    document.getElementById('pageTitle').innerText = project.title;
    document.getElementById('pageTag').innerHTML = `<span class="tag-pill">${categoryData.title}</span>`;

    // 2. Render Description as HTML
    // Use innerHTML so the <h3> and <ul> tags work
    document.getElementById('pageDescription').innerHTML = project.fullDesc;

    // 3. Update Meta-Data Bar
    const metaItems = document.querySelectorAll('.meta-item p');
    metaItems[0].innerText = project.role || "Lead Developer";
    document.getElementById('metaTech').innerText = categoryData.tags.join(', ');
    metaItems[2].innerText = project.year || "2021";

    // 3. Update Description
    document.getElementById('pageDescription').innerHTML = project.fullDesc;
    
    // Fill Metadata (Tools)
    document.getElementById('metaTech').innerText = projectData[category].tags.join(', ');
    
    // Fill Images
    const visualTrack = document.getElementById('pageVisuals');
    const container = document.getElementById('sliderContainer');
    
    currentSlideIndex = 0; 
    totalSlides = project.images.length;
    
    container.classList.toggle('single-image', totalSlides <= 1);

    visualTrack.innerHTML = project.images.map(img => `
        <img src="${img}" alt="${project.title} View" onerror="this.src='https://placehold.co/800x450/1a1a24/60a5fa?text=Image+Not+Found'">
    `).join('');
    
    updateSliderPosition();

    // Reset scroll position to top when opening
    const page = document.getElementById('projectPage');
    page.scrollTop = 0;

    // Handle Download Button Visibility
    const downloadSec = document.getElementById('downloadSection');
    const downloadBtn = document.getElementById('downloadBtn');
    if(project.downloadUrl && project.downloadUrl !== "#" && project.downloadUrl !== "") {
        downloadSec.style.display = 'block';
        downloadBtn.href = project.downloadUrl;
    } else {
        downloadSec.style.display = 'none';
    }

    // Show Overlay with Animation
    page.style.display = 'block';
    // Small delay to ensure CSS transition triggers
    requestAnimationFrame(() => {
        page.classList.add('active');
        document.body.classList.add('no-scroll');
    });
}

// --- Slider Control Functions ---
function moveSlide(direction) {
    currentSlideIndex += direction;
    
    // Loop back to start or end
    if (currentSlideIndex < 0) currentSlideIndex = totalSlides - 1;
    if (currentSlideIndex >= totalSlides) currentSlideIndex = 0;
    
    updateSliderPosition();
}

function updateSliderPosition() {
    const track = document.getElementById('pageVisuals');
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
}

function closeProjectPage() {
    const page = document.getElementById('projectPage');
    page.classList.remove('active');
    setTimeout(() => page.style.display = 'none', 400);
}

function initializePortfolio() {
    const allTags = new Set();
    Object.values(projectData).forEach(cat => cat.tags.forEach(tag => allTags.add(tag)));

    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid) {
        // Build the skill buttons to trigger openGalleryByTag
        let skillsHTML = `<div class="skill-item" onclick="openGalleryByTag('All')"><span>All Work</span></div>`;
        skillsHTML += Array.from(allTags).map(tag => `
            <div class="skill-item" onclick="openGalleryByTag('${tag}')">
                <span>${tag}</span>
            </div>
        `).join('');
        skillsGrid.innerHTML = skillsHTML;
    }

    // Initialize Project Card Tags (+X More)
    // Find this section in your initializePortfolio function
    document.querySelectorAll('.project-card').forEach(card => {
    const onclickAttr = card.getAttribute('onclick');
    if (!onclickAttr) return;
    const categoryKey = onclickAttr.match(/'([^']+)'/)[1];
    const data = projectData[categoryKey];

    if (data) {
        // If items are empty, add a visual indicator
        if (data.items.length === 0) {
            const title = card.querySelector('h3');
            title.innerHTML += ` <span style="font-size: 0.7rem; vertical-align: middle; padding: 2px 6px; background: rgba(255,255,255,0.05); border-radius: 4px; color: var(--text-dim); border: 1px solid rgba(255,255,255,0.1); margin-left: 8px;">Soon</span>`;
            card.style.opacity = "0.8"; // Make it look slightly "locked"
        }

        if (data && data.tags) {
            const tagContainer = card.querySelector('.project-tag');
            // LIMIT TAGS: Show only 2 on mobile, 3 on desktop
            const isMobile = window.innerWidth < 900;
            const maxTags = isMobile ? 2 : 3;
            
            const visibleTags = data.tags.slice(0, maxTags);
            const remaining = data.tags.length - maxTags;
            
            let html = visibleTags.map(t => `<span class="tag-pill">${t}</span>`).join('');
            if (remaining > 0) html += `<span class="tag-pill remaining">+${remaining}</span>`;
            tagContainer.innerHTML = html;
        }
    }
    });

    // Start Intersection Observer for Fade-ins
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));
}

// Call only this one
document.addEventListener('DOMContentLoaded', initializePortfolio);