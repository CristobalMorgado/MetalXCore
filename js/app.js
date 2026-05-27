/**
 * ==========================================
 *  MyPet - Interactive Application Engine
 * ==========================================
 *  Lead Engineers: senior frontend architects at Google, Apple, Vercel
 *  Design Guidelines: highly performance optimized, modular, accessible
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Core Modules
    NavbarModule.init();
    ScrollAnimationModule.init();
    StatsCounterModule.init();
    GalleryFilterModule.init();
    TestimonialsCarouselModule.init();
    ModalModule.init();
    FormsAndToastModule.init();
});

/* ==========================================
   1. NAVBAR & NAVIGATION MODULE
   ========================================== */
const NavbarModule = (() => {
    const header = document.getElementById('mainHeader');
    const menuToggle = document.getElementById('mobileMenuToggle');
    const navbar = document.getElementById('mainNavbar');
    const navLinks = document.querySelectorAll('.nav-link');

    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    const toggleMobileMenu = () => {
        const isOpen = navbar.classList.contains('active');
        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    const openMenu = () => {
        navbar.classList.add('active');
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    };

    const closeMenu = () => {
        navbar.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // Unlock scroll
    };

    const handleLinkClick = (e) => {
        navLinks.forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
        closeMenu(); // Auto-close on mobile selection
    };

    const init = () => {
        window.addEventListener('scroll', handleScroll);
        menuToggle.addEventListener('click', toggleMobileMenu);
        navLinks.forEach(link => link.addEventListener('click', handleLinkClick));
        handleScroll(); // Trigger initially to catch saved scroll positions
    };

    return { init };
})();

/* ==========================================
   2. INTERSECTION OBSERVER SCROLL ANIMATIONS
   ========================================== */
const ScrollAnimationModule = (() => {
    const animatedElements = document.querySelectorAll('.scroll-anim');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const handleIntersect = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                // Get customizable animation delay from DOM attributes
                const delay = element.getAttribute('data-delay') || 0;
                
                setTimeout(() => {
                    element.classList.add('animated');
                }, delay);

                observer.unobserve(element); // Performant: animate once only
            }
        });
    };

    const init = () => {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(handleIntersect, observerOptions);
            animatedElements.forEach(element => observer.observe(element));
        } else {
            // Fallback for older browsers
            animatedElements.forEach(element => element.classList.add('animated'));
        }
    };

    return { init };
})();

/* ==========================================
   3. ANIMATED STATISTICS COUNTER MODULE
   ========================================== */
const StatsCounterModule = (() => {
    const statNumbers = document.querySelectorAll('.stat-number');

    const animateCount = (element) => {
        const target = parseInt(element.getAttribute('data-target'), 10);
        const duration = 2000; // Total count duration in ms
        const frameRate = 1000 / 60; // 60 FPS
        const totalFrames = Math.round(duration / frameRate);
        let frame = 0;

        const countTimer = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            // EaseOutQuad formula for clean decelerating count
            const easeProgress = progress * (2 - progress);
            const currentValue = Math.round(easeProgress * target);

            element.textContent = target > 100 ? currentValue.toLocaleString() + '+' : currentValue + '+';

            if (frame >= totalFrames) {
                element.textContent = target > 100 ? target.toLocaleString() + '+' : target + '+';
                clearInterval(countTimer);
            }
        }, frameRate);
    };

    const init = () => {
        const section = document.getElementById('stats');
        if (!section) return;

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        statNumbers.forEach(number => animateCount(number));
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            observer.observe(section);
        } else {
            // Fallback
            statNumbers.forEach(number => {
                const target = number.getAttribute('data-target');
                number.textContent = target + '+';
            });
        }
    };

    return { init };
})();

/* ==========================================
   4. DYNAMIC INTERACTIVE GALLERY FILTERS
   ========================================== */
const GalleryFilterModule = (() => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const petCards = document.querySelectorAll('.pet-card');
    const grid = document.getElementById('petGrid');

    const filterGallery = (category) => {
        // Soft fade out grid content
        grid.style.opacity = '0.3';
        grid.style.transform = 'translateY(10px)';
        grid.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

        setTimeout(() => {
            petCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (category === 'all' || cardCategory === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });

            // Soft fade in grid content
            grid.style.opacity = '1';
            grid.style.transform = 'translateY(0)';
        }, 250);
    };

    const handleButtonClick = (e) => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        const filterValue = e.currentTarget.getAttribute('data-filter');
        filterGallery(filterValue);
    };

    const init = () => {
        filterButtons.forEach(btn => btn.addEventListener('click', handleButtonClick));
    };

    return { init };
})();

/* ==========================================
   5. TESTIMONIALS SLIDER / CAROUSEL
   ========================================== */
const TestimonialsCarouselModule = (() => {
    const container = document.getElementById('carouselContainer');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');
    const dots = document.querySelectorAll('#carouselDots .dot');
    
    let currentIndex = 0;
    const slidesCount = 2; // Testimonial slides size

    const updateCarousel = (index) => {
        currentIndex = index;
        container.style.transform = `translateX(-${currentIndex * 50}%)`;
        
        // Update pagination dots status
        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };

    const showNext = () => {
        let index = currentIndex + 1;
        if (index >= slidesCount) index = 0;
        updateCarousel(index);
    };

    const showPrev = () => {
        let index = currentIndex - 1;
        if (index < 0) index = slidesCount - 1;
        updateCarousel(index);
    };

    const init = () => {
        if (!container || !prevBtn || !nextBtn) return;

        nextBtn.addEventListener('click', showNext);
        prevBtn.addEventListener('click', showPrev);

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => updateCarousel(index));
        });

        // Optional: Auto play testimonials slide every 8s
        setInterval(showNext, 8000);
    };

    return { init };
})();

/* ==========================================
   6. PREMIUM MODAL INTERACTIVITY CONTROLLER
   ========================================== */
const ModalModule = (() => {
    // Adoption Modal Elements
    const adoptionModal = document.getElementById('adoptionModal');
    const closeAdoptionBtn = document.getElementById('closeAdoptionModal');
    const selectedPetInput = document.getElementById('selectedPetInput');
    const modalPetName = document.getElementById('modalPetName');
    const modalPetBreed = document.getElementById('modalPetBreed');
    const modalPetImage = document.getElementById('modalPetImage');

    // Donation Modal Elements
    const donationModal = document.getElementById('donationModal');
    const closeDonationBtn = document.getElementById('closeDonationModal');
    const fabDonation = document.getElementById('fabDonation');
    const btnHeaderDonate = document.getElementById('btnHeaderDonate');
    const btnFinalDonate = document.getElementById('btnFinalDonate');
    
    // Donation Form Elements
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmountGroup = document.getElementById('customAmountGroup');
    const customAmountInput = document.getElementById('customDonationAmount');
    const payIcons = document.querySelectorAll('.pay-icon');

    // Open/Close Generic Logic
    const openModal = (modal) => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Avoid background page scroll
    };

    const closeModal = (modal) => {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Release scroll
    };

    // Specific Adoption Modal Injector
    const openAdoption = (name, imgSource, breed) => {
        selectedPetInput.value = name;
        modalPetName.textContent = name;
        modalPetBreed.textContent = breed;
        modalPetImage.src = `img/${imgSource}`;
        modalPetImage.alt = `Foto de perfil de la mascota rescatada ${name}`;
        
        openModal(adoptionModal);
    };

    const handleDonationAmountClick = (e) => {
        amountButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');

        const amount = e.currentTarget.getAttribute('data-amount');
        if (amount === 'custom') {
            customAmountGroup.classList.remove('d-none');
            customAmountInput.setAttribute('required', 'true');
            customAmountInput.focus();
        } else {
            customAmountGroup.classList.add('d-none');
            customAmountInput.removeAttribute('required');
            customAmountInput.value = '';
        }
    };

    const handlePaymentMethodClick = (e) => {
        payIcons.forEach(icon => icon.classList.remove('active'));
        e.currentTarget.classList.add('active');
    };

    const init = () => {
        // Global close triggers
        window.addEventListener('click', (e) => {
            if (e.target === adoptionModal) closeModal(adoptionModal);
            if (e.target === donationModal) closeModal(donationModal);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal(adoptionModal);
                closeModal(donationModal);
            }
        });

        closeAdoptionBtn.addEventListener('click', () => closeModal(adoptionModal));
        closeDonationBtn.addEventListener('click', () => closeModal(donationModal));

        // Donation Modal openers
        const donationOpeners = [fabDonation, btnHeaderDonate, btnFinalDonate];
        donationOpeners.forEach(opener => {
            if (opener) {
                opener.addEventListener('click', () => openModal(donationModal));
            }
        });

        // Donation options controls
        amountButtons.forEach(btn => btn.addEventListener('click', handleDonationAmountClick));
        payIcons.forEach(icon => icon.addEventListener('click', handlePaymentMethodClick));
    };

    return { 
        init,
        openAdoption,
        closeAdoption: () => closeModal(adoptionModal),
        closeDonation: () => closeModal(donationModal)
    };
})();

// Global wrapper to trigger adoption modal directly from card's inline attributes
window.openAdoptionModal = (name, imgSource, breed) => {
    ModalModule.openAdoption(name, imgSource, breed);
};

/* ==========================================
   7. FORM HANDLING & PREMIUM TOAST ENGINE
   ========================================== */
const FormsAndToastModule = (() => {
    const newsletterForm = document.getElementById('newsletterForm');
    const adoptionForm = document.getElementById('adoptionRequestForm');
    const donationForm = document.getElementById('donationForm');
    const toastContainer = document.getElementById('toastContainer');

    // Programmatic Toast Generator
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <span class="toast-message">${message}</span>
        `;
        
        toastContainer.appendChild(toast);

        // Animation Entrance
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        // Self destroy toast after 4.5 seconds
        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.4s ease forwards';
            toast.addEventListener('animationend', () => {
                toast.remove();
            });
        }, 4500);
    };

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletterEmail');
        const email = emailInput.value.trim();
        const feedback = document.getElementById('newsletterFeedback');

        if (email) {
            // Simulated asynchronous subscription
            feedback.className = 'form-feedback success';
            feedback.textContent = '¡Suscripción completada! Bienvenido a nuestra manada. 🐾';
            emailInput.value = '';
            
            showToast('¡Te has suscrito con éxito al boletín de MyPet!');
            
            setTimeout(() => {
                feedback.textContent = '';
            }, 5000);
        }
    };

    const handleAdoptionFormSubmit = (e) => {
        e.preventDefault();
        const adopterName = document.getElementById('adopterName').value;
        const petName = document.getElementById('selectedPetInput').value;

        // Simulated asynchronous API adoption call
        ModalModule.closeAdoption();
        
        // Reset form
        adoptionForm.reset();

        showToast(`¡Solicitud enviada! Nos pondremos en contacto contigo pronto por ${petName}. ❤️`);
    };

    const handleDonationSubmit = (e) => {
        e.preventDefault();
        const donorEmail = document.getElementById('donorEmail').value;
        const activeAmountBtn = document.querySelector('.amount-btn.active');
        let amountText = '';

        if (activeAmountBtn.getAttribute('data-amount') === 'custom') {
            amountText = `$${document.getElementById('customDonationAmount').value} USD`;
        } else {
            amountText = activeAmountBtn.textContent;
        }

        // Simulated asynchronous Payment Gateway API call
        ModalModule.closeDonation();
        
        // Reset form
        donationForm.reset();
        document.getElementById('customAmountGroup').classList.add('d-none');
        document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.amount-btn')[0].classList.add('active'); // reset to 10 USD option

        showToast(`¡Muchas gracias por tu donación de ${amountText}! Estás salvando vidas. 🐾`);
    };

    const init = () => {
        if (newsletterForm) newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        if (adoptionForm) adoptionForm.addEventListener('submit', handleAdoptionFormSubmit);
        if (donationForm) donationForm.addEventListener('submit', handleDonationSubmit);
    };

    return { 
        init,
        showToast 
    };
})();

// Global callbacks for forms matching HTML
window.handleNewsletterSubmit = (e) => {
    FormsAndToastModule.init();
};
window.handleAdoptionFormSubmit = (e) => {
    FormsAndToastModule.init();
};
window.handleDonationSubmit = (e) => {
    FormsAndToastModule.init();
};
