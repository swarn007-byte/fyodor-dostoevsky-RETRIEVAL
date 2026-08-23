// ===== Menu Data =====
const menuData = {
    coffee: [
        {
            name: "Classic Espresso",
            price: "$3.50",
            description: "Rich, bold espresso shot with a perfect crema",
            image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop",
            tags: ["Classic", "Strong"]
        },
        {
            name: "Cappuccino",
            price: "$5.00",
            description: "Espresso with steamed milk and a thick layer of foam",
            image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop",
            tags: ["Popular", "Creamy"]
        },
        {
            name: "Caffè Latte",
            price: "$5.50",
            description: "Smooth espresso with plenty of steamed milk",
            image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
            tags: ["Mild", "Smooth"]
        },
        {
            name: "Mocha",
            price: "$6.00",
            description: "Espresso with chocolate and steamed milk, topped with whipped cream",
            image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=400&h=300&fit=crop",
            tags: ["Sweet", "Chocolate"]
        },
        {
            name: "Americano",
            price: "$4.00",
            description: "Espresso diluted with hot water for a smooth taste",
            image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
            tags: ["Classic", "Light"]
        },
        {
            name: "Flat White",
            price: "$5.50",
            description: "Velvety microfoam with a double shot of espresso",
            image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&h=300&fit=crop",
            tags: ["Creamy", "Strong"]
        }
    ],
    specialty: [
        {
            name: "Lavender Latte",
            price: "$6.50",
            description: "Espresso with lavender syrup and oat milk",
            image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&h=300&fit=crop",
            tags: ["Floral", "Unique"]
        },
        {
            name: "Honey Cinnamon",
            price: "$6.00",
            description: "Espresso with honey and cinnamon spice",
            image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop",
            tags: ["Sweet", "Spicy"]
        },
        {
            name: "Caramel Macchiato",
            price: "$6.50",
            description: "Vanilla-infused milk with espresso and caramel drizzle",
            image: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400&h=300&fit=crop",
            tags: ["Sweet", "Popular"]
        },
        {
            name: "Matcha Latte",
            price: "$6.00",
            description: "Premium matcha with steamed milk",
            image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=300&fit=crop",
            tags: ["Green Tea", "Healthy"]
        },
        {
            name: "Vanilla Bean",
            price: "$6.50",
            description: "Real vanilla bean with espresso and steamed milk",
            image: "https://images.unsplash.com/photo-1579888944880-d98341245702?w=400&h=300&fit=crop",
            tags: ["Sweet", "Classic"]
        },
        {
            name: "Pumpkin Spice",
            price: "$7.00",
            description: "Seasonal favorite with pumpkin and warm spices",
            image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
            tags: ["Seasonal", "Spicy"]
        }
    ],
    pastries: [
        {
            name: "Butter Croissant",
            price: "$3.50",
            description: "Flaky, buttery layers of perfection",
            image: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&h=300&fit=crop",
            tags: ["Classic", "Fresh"]
        },
        {
            name: "Blueberry Muffin",
            price: "$4.00",
            description: "Moist muffin loaded with fresh blueberries",
            image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=300&fit=crop",
            tags: ["Fruity", "Sweet"]
        },
        {
            name: "Cinnamon Roll",
            price: "$4.50",
            description: "Soft, gooey roll with cream cheese frosting",
            image: "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=400&h=300&fit=crop",
            tags: ["Sweet", "Indulgent"]
        },
        {
            name: "Chocolate Brownie",
            price: "$4.00",
            description: "Rich, fudgy brownie with chocolate chunks",
            image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop",
            tags: ["Chocolate", "Rich"]
        },
        {
            name: "Almond Biscotti",
            price: "$3.00",
            description: "Crunchy Italian cookie perfect for dipping",
            image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop",
            tags: ["Crunchy", "Nutty"]
        },
        {
            name: "Banana Bread",
            price: "$4.50",
            description: "Moist banana bread with walnuts",
            image: "https://images.unsplash.com/photo-1585478259715-876acc5be8fc?w=400&h=300&fit=crop",
            tags: ["Moist", "Classic"]
        }
    ],
    cold: [
        {
            name: "Iced Latte",
            price: "$5.50",
            description: "Chilled espresso with cold milk over ice",
            image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
            tags: ["Refreshing", "Classic"]
        },
        {
            name: "Cold Brew",
            price: "$5.00",
            description: "Slow-steeped for 20 hours, smooth and bold",
            image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
            tags: ["Strong", "Smooth"]
        },
        {
            name: "Frappuccino",
            price: "$7.00",
            description: "Blended coffee with milk and ice, topped with whipped cream",
            image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop",
            tags: ["Sweet", "Frozen"]
        },
        {
            name: "Mango Smoothie",
            price: "$6.50",
            description: "Fresh mango blended with yogurt",
            image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop",
            tags: ["Fruity", "Healthy"]
        },
        {
            name: "Iced Matcha",
            price: "$6.00",
            description: "Chilled matcha latte over ice",
            image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=300&fit=crop",
            tags: ["Green Tea", "Refreshing"]
        },
        {
            name: "Lemonade",
            price: "$4.50",
            description: "Freshly squeezed with a hint of mint",
            image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop",
            tags: ["Citrus", "Refreshing"]
        }
    ]
};

// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const menuGrid = document.getElementById('menuGrid');
const testimonialTrack = document.getElementById('testimonialTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const navDots = document.getElementById('navDots');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const backToTop = document.getElementById('backToTop');
const contactForm = document.getElementById('contactForm');
const tabBtns = document.querySelectorAll('.tab-btn');

// ===== State =====
let currentTestimonial = 0;
let currentCategory = 'coffee';
let navOverlay = null;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMenu();
    initTestimonials();
    initGallery();
    initLightbox();
    initBackToTop();
    initContactForm();
    initScrollAnimations();
    initNavLinks();
});

// ===== Navbar Functions =====
function initNavbar() {
    // Create overlay for mobile menu
    navOverlay = document.createElement('div');
    navOverlay.className = 'nav-overlay';
    document.body.appendChild(navOverlay);

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu on overlay click
    navOverlay.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });

    // Close menu on link click
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ===== Navigation Links =====
function initNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ===== Menu Functions =====
function initMenu() {
    renderMenu(currentCategory);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderMenu(currentCategory);
        });
    });
}

function renderMenu(category) {
    const items = menuData[category];
    menuGrid.innerHTML = items.map((item, index) => `
        <div class="menu-item fade-in" style="animation-delay: ${index * 0.1}s">
            <div class="menu-item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <h3 class="menu-item-name">${item.name}</h3>
                    <span class="menu-item-price">${item.price}</span>
                </div>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-tags">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Trigger animations
    setTimeout(() => {
        document.querySelectorAll('.menu-item.fade-in').forEach((item, index) => {
            setTimeout(() => item.classList.add('visible'), index * 100);
        });
    }, 50);
}

// ===== Testimonials Functions =====
function initTestimonials() {
    const cards = testimonialTrack.querySelectorAll('.testimonial-card');
    const totalSlides = cards.length;

    // Create dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = `nav-dot ${i === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(i));
        navDots.appendChild(dot);
    }

    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial - 1 + totalSlides) % totalSlides;
        updateSlider();
    });

    nextBtn.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial + 1) % totalSlides;
        updateSlider();
    });

    // Auto slide
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % totalSlides;
        updateSlider();
    }, 5000);
}

function goToSlide(index) {
    currentTestimonial = index;
    updateSlider();
}

function updateSlider() {
    testimonialTrack.style.transform = `translateX(-${currentTestimonial * 100}%)`;
    
    document.querySelectorAll('.nav-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === currentTestimonial);
    });
}

// ===== Gallery Functions =====
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            lightboxImg.src = img.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
}

// ===== Lightbox Functions =====
function initLightbox() {
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Back to Top =====
function initBackToTop() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== Contact Form =====
function initContactForm() {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');

        // Simple validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email', 'error');
            return;
        }

        // Simulate form submission
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        setTimeout(() => {
            showNotification('Message sent successfully!', 'success');
            contactForm.reset();
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== Scroll Animations =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ===== Add notification styles dynamically =====
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: var(--text-white);
        padding: 15px 30px;
        border-radius: 10px;
        box-shadow: var(--shadow-lg);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 3000;
        transition: transform 0.3s ease;
    }
    .notification.show {
        transform: translateX(-50%) translateY(0);
    }
    .notification.success {
        border-left: 4px solid #28a745;
    }
    .notification.success i {
        color: #28a745;
    }
    .notification.error {
        border-left: 4px solid #dc3545;
    }
    .notification.error i {
        color: #dc3545;
    }
`;
document.head.appendChild(style);