// --- 1. Animated Particle Background ---
        const canvas = document.getElementById('bgCanvas');
        const ctx = canvas.getContext('2d');
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const particles = [];
        const particleCount = 80;

        class Particle {
            constructor() {
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

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

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
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.15 - distance/1000})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            requestAnimationFrame(animate);
        }
        animate();

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

        // --- 4. Gallery Overlay Functionality ---
        function openGallery(cat) {
            const data = projectData[cat];
            if(!data) return;

            document.getElementById('galleryTitle').innerText = data.title;
            document.getElementById('galleryTag').innerText = data.tag;
            
            const grid = document.getElementById('galleryGrid');
            
            grid.innerHTML = data.items.map((item, index) => `
                <div class="gallery-item" onclick="openProjectPage('${cat}', ${index})">
                    <div class="gallery-img-container">
                        <img src="${item.images[0]}" alt="${item.title}" style="width:100%; height:250px; object-fit:cover;">
                        <div class="img-overlay-text">View Project</div>
                    </div>
                    <div class="gallery-info">
                        <h4>${item.title}</h4>
                        <p>${item.desc}</p>
                    </div>
                </div>
            `).join('');

            const overlay = document.getElementById('galleryOverlay');
            overlay.style.display = 'block';
            
            setTimeout(() => {
                overlay.classList.add('active');
                document.body.classList.add('no-scroll');
            }, 10);
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
            
            // Fill Text
            document.getElementById('pageTitle').innerText = project.title;
            document.getElementById('pageTag').innerText = projectData[category].tag;
            document.getElementById('pageDescription').innerText = project.fullDesc;
            
            // Fill Images
            const visualTrack = document.getElementById('pageVisuals');
            const container = document.getElementById('sliderContainer');
            
            currentSlideIndex = 0; // Reset slider position
            totalSlides = project.images.length;
            
            // Check if there is only one image
            if (totalSlides <= 1) {
                container.classList.add('single-image');
            } else {
                container.classList.remove('single-image');
            }

            visualTrack.innerHTML = project.images.map(img => `
                <img src="${img}" alt="Project View" onerror="this.src='https://via.placeholder.com/800x450/1a1a24/60a5fa?text=Image+Not+Found'">
            `).join('');
            
            updateSliderPosition();

            // Handle Download Button
            const downloadSec = document.getElementById('downloadSection');
            const downloadBtn = document.getElementById('downloadBtn');
            if(project.downloadUrl && project.downloadUrl !== "#" && project.downloadUrl !== "") {
                downloadSec.style.display = 'block';
                downloadBtn.href = project.downloadUrl;
            } else {
                downloadSec.style.display = 'none';
            }

            // Show Overlay
            const page = document.getElementById('projectPage');
            page.style.display = 'block';
            setTimeout(() => page.classList.add('active'), 10);
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