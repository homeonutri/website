/**
 * Sustain with Mona – Enhanced Script
 * Features: Smooth scroll, PDF downloads, modal, navbar, poster, back-to-top
 * Author: xAI Assistant | Updated: Nov 10, 2025
 */

(() => {
    'use strict';

    // ==============================
    // CONFIG & CONSTANTS
    // ==============================
    const PDF_MAP = {
        toolkit:   'Small_Swaps_Toolkit.pdf',
        mealprep:  'Meal_Prep_Templates.pdf',
        lesson:    'School_Lesson_Plans.pdf',
        chapter:   'Free_Chapter.pdf'
    };

    const SELECTORS = {
        loader: '#loader',
        navbar: '.navbar',
        navLinks: '.nav-link',
        sections: 'section[id]',
        downloadBtns: '.download-btn',
        backToTop: '#backToTop',
        chapterModal: '#chapterModal',
        chapterForm: '#chapterForm',
        openChapterModal: '#openChapterModal',
        contactForm: '#contactForm',
        swapPoints: '.swap-point'
    };

    // Debounce utility
    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Email regex
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ==============================
    // INITIALIZATION
    // ==============================
    document.addEventListener('DOMContentLoaded', () => {
        initLoader();
        initNavbar();
        initSmoothScroll();
        initPosterTooltips();
        initDownloadButtons();
        initChapterModal();
        initContactForm();
        initBackToTop();
        initActiveSection();
    });

    // ==============================
    // PAGE LOADER
    // ==============================
    function initLoader() {
        const loader = document.querySelector(SELECTORS.loader);
        if (!loader) return;

        window.addEventListener('load', () => {
            loader.style.transition = 'opacity 0.6s ease';
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 600);
        });
    }

    // ==============================
    // NAVBAR SCROLL EFFECT
    // ==============================
    function initNavbar() {
        const navbar = document.querySelector(SELECTORS.navbar);
        if (!navbar) return;

        const handleScroll = debounce(() => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    // ==============================
    // ACTIVE SECTION HIGHLIGHT
    // ==============================
    function initActiveSection() {
        const sections = document.querySelectorAll(SELECTORS.sections);
        const navLinks = document.querySelectorAll(SELECTORS.navLinks);

        if (!sections.length || !navLinks.length) return;

        const updateActiveLink = debounce(() => {
            let current = '';
            sections.forEach(sec => {
                const rect = sec.getBoundingClientRect();
                if (rect.top <= 120 && rect.bottom >= 120) {
                    current = sec.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
            });
        }, 50);

        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink(); // Initial check
    }

    // ==============================
    // SMOOTH SCROLL
    // ==============================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const href = anchor.getAttribute('href');
                if (href === '#' || href === '#!') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                const offset = 80;
                const targetPosition = target.offsetTop - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without jump
                history.pushState(null, null, href);
            });
        });
    }

    // ==============================
    // POSTER INTERACTIVE TOOLTIPS
    // ==============================
    function initPosterTooltips() {
        document.querySelectorAll(SELECTORS.swapPoints).forEach(point => {
            const tooltip = point.querySelector('.tooltip');
            if (!tooltip) return;

            // Hover (desktop)
            point.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateX(-50%) translateY(-8px)';
            });
            point.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateX(-50%) translateY(0)';
            });

            // Click (mobile + alert)
            point.addEventListener('click', () => {
                const tip = point.dataset.tip || 'Try this swap!';
                alert(tip);
            });

            // Touch support
            let touchTimer;
            point.addEventListener('touchstart', () => {
                touchTimer = setTimeout(() => {
                    tooltip.style.opacity = '1';
                }, 300);
            });
            point.addEventListener('touchend', () => {
                clearTimeout(touchTimer);
                setTimeout(() => {
                    tooltip.style.opacity = '0';
                }, 1500);
            });
        });
    }

    // ==============================
    // PDF DOWNLOADS
    // ==============================
    function downloadResource(key) {
        const file = PDF_MAP[key];
        if (!file) {
            console.error(`PDF not found: ${key}`);
            alert('Sorry, this resource is not available.');
            return;
        }

        const a = document.createElement('a');
        a.href = file;
        a.download = file;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Analytics event (replace with GA, GTM, etc.)
        console.log(`Downloaded: ${file}`);
        // gtag('event', 'download', { resource: key });
    }

    function initDownloadButtons() {
        document.querySelectorAll(SELECTORS.downloadBtns).forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault();
                const key = btn.dataset.resource;

                if (key === 'chapter') {
                    openModal();
                } else if (PDF_MAP[key]) {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
                    setTimeout(() => {
                        downloadResource(key);
                        btn.disabled = false;
                        btn.innerHTML = 'Download PDF';
                    }, 800);
                }
            });
        });
    }

    // ==============================
    // CHAPTER MODAL & EMAIL
    // ==============================
    let chapterModal;
    function initChapterModal() {
        const modalEl = document.querySelector(SELECTORS.chapterModal);
        if (!modalEl) return;

        chapterModal = new bootstrap.Modal(modalEl, { keyboard: true });

        // Open from button
        const openBtn = document.querySelector(SELECTORS.openChapterModal);
        if (openBtn) {
            openBtn.addEventListener('click', () => chapterModal.show());
        }

        // Form submit
        const form = document.querySelector(SELECTORS.chapterForm);
        if (form) {
            form.addEventListener('submit', e => {
                e.preventDefault();
                const emailInput = form.querySelector('input[type="email"]');
                const email = emailInput.value.trim();

                if (!email) {
                    showFormError('Please enter your email.');
                    return;
                }
                if (!EMAIL_REGEX.test(email)) {
                    showFormError('Please enter a valid email.');
                    return;
                }

                // Simulate sending
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

                setTimeout(() => {
                    downloadResource('chapter');
                    alert(`Chapter sent to ${email}! Check your Downloads.`);
                    chapterModal.hide();
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Send Chapter';
                }, 1200);
            });
        }
    }

    function openModal() {
        if (chapterModal) chapterModal.show();
    }

    function showFormError(msg) {
        // Simple inline error
        let error = document.querySelector('#chapterForm .form-error');
        if (!error) {
            error = document.createElement('div');
            error.className = 'form-error text-danger mt-2 small';
            document.querySelector('#chapterForm .input-group').after(error);
        }
        error.textContent = msg;
        setTimeout(() => error.textContent = '', 4000);
    }

    // ==============================
    // CONTACT FORM
    // ==============================
    function initContactForm() {
        const form = document.querySelector(SELECTORS.contactForm);
        if (!form) return;

        form.addEventListener('submit', e => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            setTimeout(() => {
                alert("Thank you! Your message has been sent. We'll reply within 24 hours.");
                form.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message';
            }, 1000);
        });
    }

    // ==============================
    // BACK TO TOP
    // ==============================
    function initBackToTop() {
        const btn = document.querySelector(SELECTORS.backToTop);
        if (!btn) return;

        const toggleVisibility = debounce(() => {
            btn.classList.toggle('show', window.scrollY > 400);
        }, 100);

        window.addEventListener('scroll', toggleVisibility);

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

}
)
()
// === ADMIN LOGIN SYSTEM ===
const ADMIN_USERNAME = "mona";       
const ADMIN_PASSWORD = "12345";

const loginOverlay = document.getElementById('loginOverlay');
const adminPanel = document.getElementById('adminPanel');
const loginError = document.getElementById('loginError');

let isAdmin = false;

// Guest button
document.getElementById('guestBtn').addEventListener('click', () => {
    loginOverlay.classList.add('d-none');
});

// Admin login
document.getElementById('adminLoginBtn').addEventListener('click', () => {
    const user = document.getElementById('adminUsername').value.trim();
    const pass = document.getElementById('adminPassword').value;

    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
        isAdmin = true;
        loginOverlay.classList.add('d-none');
        adminPanel.classList.remove('d-none');
        loginError.classList.add('d-none');
        showAdminFeatures();
    } else {
        loginError.classList.remove('d-none');
    }
});

// Close & logout
document.getElementById('closeAdminPanel').addEventListener('click', () => adminPanel.classList.add('d-none'));
document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    isAdmin = false;
    adminPanel.classList.add('d-none');
    loginOverlay.classList.remove('d-none'); // force re-login next time
});

// === ADMIN FEATURES ===
function showAdminFeatures() {
    // 1. Make all review cards editable
    document.querySelectorAll('.carousel-item .bg-white').forEach(card => {
        if (!card.querySelector('.admin-actions')) {
            const actions = document.createElement('div');
            actions.className = 'admin-actions mt-3 d-flex gap-2 justify-content-center';
            actions.innerHTML = `
                <button class="btn btn-sm btn-warning edit-review"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-review"><i class="fas fa-trash"></i></button>
            `;
            card.appendChild(actions);

            // Edit button
            actions.querySelector('.edit-review').addEventListener('click', () => {
                const text = card.querySelector('p.fst-italic').textContent.replace(/['"]+/g, '');
                const name = card.querySelector('p.fw-bold').textContent;
                const newText = prompt('Edit review text:', text);
                const newName = prompt('Edit name:', name);
                if (newText !== null) card.querySelector('p.fst-italic').textContent = `"${newText}"`;
                if (newName !== null) card.querySelector('p.fw-bold').textContent = newName ? `— ${newName}` : '';
            });

            // Delete button
            actions.querySelector('.delete-review').addEventListener('click', () => {
                if (confirm('Delete this review?')) card.parentElement.remove();
            });
        }
    });
}
(() => {
    'use strict';

    // ==============================
    // CONFIG & CONSTANTS
    // ==============================
    const PDF_MAP = {
        toolkit:   'Small_Swaps_Toolkit.pdf',
        mealprep:  'Meal_Prep_Templates.pdf',
        lesson:    'School_Lesson_Plans.pdf',
        chapter:   'Free_Chapter.pdf'
    };

    const SELECTORS = {
        loader: '#loader',
        navbar: '.navbar',
        navLinks: '.nav-link',
        sections: 'section[id]',
        downloadBtns: '.download-btn',
        backToTop: '#backToTop',
        chapterModal: '#chapterModal',
        chapterForm: '#chapterForm',
        openChapterModal: '#openChapterModal',
        contactForm: '#contactForm',
        swapPoints: '.swap-point'
    };

    // Debounce utility
    const debounce = (func, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Email regex
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ==============================
    // INITIALIZATION
    // ==============================
    document.addEventListener('DOMContentLoaded', () => {
        initLoader();
        initNavbar();
        initSmoothScroll();
        initPosterTooltips();
        initDownloadButtons();
        initChapterModal();
        initContactForm();
        initBackToTop();
        initActiveSection();
        initFirebaseAndReviews(); // New: Firebase + Reviews system
    });

    // ==============================
    // PAGE LOADER
    // ==============================
    function initLoader() {
        const loader = document.querySelector(SELECTORS.loader);
        if (!loader) return;

        window.addEventListener('load', () => {
            loader.style.transition = 'opacity 0.6s ease';
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 600);
        });
    }

    // ==============================
    // NAVBAR SCROLL EFFECT
    // ==============================
    function initNavbar() {
        const navbar = document.querySelector(SELECTORS.navbar);
        if (!navbar) return;

        const handleScroll = debounce(() => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    // ==============================
    // ACTIVE SECTION HIGHLIGHT
    // ==============================
    function initActiveSection() {
        const sections = document.querySelectorAll(SELECTORS.sections);
        const navLinks = document.querySelectorAll(SELECTORS.navLinks);

        if (!sections.length || !navLinks.length) return;

        const updateActiveLink = debounce(() => {
            let current = '';
            sections.forEach(sec => {
                const rect = sec.getBoundingClientRect();
                if (rect.top <= 120 && rect.bottom >= 120) {
                    current = sec.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
            });
        }, 50);

        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink();
    }

    // ==============================
    // SMOOTH SCROLL
    // ==============================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const href = anchor.getAttribute('href');
                if (href === '#' || href === '#!') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                history.pushState(null, null, href);
            });
        });
    }

    // ==============================
    // POSTER INTERACTIVE TOOLTIPS
    // ==============================
    function initPosterTooltips() {
        document.querySelectorAll(SELECTORS.swapPoints).forEach(point => {
            const tooltip = point.querySelector('.tooltip');
            if (!tooltip) return;

            point.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateX(-50%) translateY(-8px)';
            });
            point.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateX(-50%) translateY(0)';
            });

            point.addEventListener('click', () => {
                const tip = point.dataset.tip || 'Try this swap!';
                alert(tip);
            });

            let touchTimer;
            point.addEventListener('touchstart', () => {
                touchTimer = setTimeout(() => {
                    tooltip.style.opacity = '1';
                }, 300);
            });
            point.addEventListener('touchend', () => {
                clearTimeout(touchTimer);
                setTimeout(() => tooltip.style.opacity = '0', 1500);
            });
        });
    }

    // ==============================
    // PDF DOWNLOADS
    // ==============================
    function downloadResource(key) {
        const file = PDF_MAP[key];
        if (!file) {
            console.error(`PDF not found: ${key}`);
            alert('Sorry, this resource is not available.');
            return;
        }

        const a = document.createElement('a');
        a.href = file;
        a.download = file;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log(`Downloaded: ${file}`);
    }

    function initDownloadButtons() {
        document.querySelectorAll(SELECTORS.downloadBtns).forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault();
                const key = btn.dataset.resource;

                if (key === 'chapter') {
                    openModal();
                } else if (PDF_MAP[key]) {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
                    setTimeout(() => {
                        downloadResource(key);
                        btn.disabled = false;
                        btn.innerHTML = 'Download PDF';
                    }, 800);
                }
            });
        });
    }

    // ==============================
    // CHAPTER MODAL & EMAIL
    // ==============================
    let chapterModal;
    function initChapterModal() {
        const modalEl = document.querySelector(SELECTORS.chapterModal);
        if (!modalEl) return;

        chapterModal = new bootstrap.Modal(modalEl, { keyboard: true });

        const openBtn = document.querySelector(SELECTORS.openChapterModal);
        if (openBtn) {
            openBtn.addEventListener('click', () => chapterModal.show());
        }

        const form = document.querySelector(SELECTORS.chapterForm);
        if (form) {
            form.addEventListener('submit', e => {
                e.preventDefault();
                const emailInput = form.querySelector('input[type="email"]');
                const email = emailInput.value.trim();

                if (!email) {
                    showFormError('Please enter your email.');
                    return;
                }
                if (!EMAIL_REGEX.test(email)) {
                    showFormError('Please enter a valid email.');
                    return;
                }

                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

                setTimeout(() => {
                    downloadResource('chapter');
                    alert(`Chapter sent to ${email}! Check your Downloads.`);
                    chapterModal.hide();
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Send Chapter';
                }, 1200);
            });
        }
    }

    function openModal() {
        if (chapterModal) chapterModal.show();
    }

    function showFormError(msg) {
        let error = document.querySelector('#chapterForm .form-error');
        if (!error) {
            error = document.createElement('div');
            error.className = 'form-error text-danger mt-2 small';
            document.querySelector('#chapterForm .input-group').after(error);
        }
        error.textContent = msg;
        setTimeout(() => error.textContent = '', 4000);
    }

    // ==============================
    // CONTACT FORM
    // ==============================
    function initContactForm() {
        const form = document.querySelector(SELECTORS.contactForm);
        if (!form) return;

        // The real submission is now handled by Firebase part below
        form.addEventListener('submit', e => {
            e.preventDefault();
            // Visual feedback only (real submit happens in Firebase section)
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Let Firebase handler take over the actual save & success message
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message';
            }, 2000);
        });
    }

    // ==============================
    // BACK TO TOP
    // ==============================
    function initBackToTop() {
        const btn = document.querySelector(SELECTORS.backToTop);
        if (!btn) return;

        const toggleVisibility = debounce(() => {
            btn.classList.toggle('show', window.scrollY > 400);
        }, 100);

        window.addEventListener('scroll', toggleVisibility);

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==============================
    // ===== FIREBASE + REVIEWS SYSTEM =====
    // ==============================
    async function initFirebaseAndReviews() {
        // ===== 1. FIREBASE SETUP =====
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js");
        const {
            getFirestore, collection, addDoc, onSnapshot,
            deleteDoc, doc, updateDoc, serverTimestamp
        } = await import("https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js");

        const firebaseConfig = {
            apiKey: "AIzaSyCbPrEiKYhKUd6uMdPFTL4I9RWa8nJS33Y",
            authDomain: "homeonutri-e4030.firebaseapp.com",
            projectId: "homeonutri-e4030",
            storageBucket: "homeonutri-e4030.firebasestorage.app",
            messagingSenderId: "696978966420",
            appId: "1:696978966420:web:6a610ad8651ef946bab181",
            measurementId: "G-ZS7DKV67Y5"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        const reviewsRef = collection(db, "reviews");
        const contactsRef = collection(db, "contacts");

        // ===== 2. ADMIN CREDENTIALS =====
        const ADMIN_USERNAME = "mona";
        const ADMIN_PASSWORD = "homeo2025nutri";  // CHANGE THIS!
        let isAdmin = false;

        // ===== 3. INJECT GUEST REVIEW FORM =====
        const guestReviewHTML = `
            <div class="container my-5">
              <div class="text-center">
                <h4 class="mb-4">Leave a Review</h4>
                <form id="guestReviewForm" class="row g-3 justify-content-center">
                  <div class="col-md-5">
                    <input type="text" id="guestName" class="form-control" placeholder="Your Name" required>
                  </div>
                  <div class="col-md-5">
                    <textarea id="guestReviewText" class="form-control" rows="3" placeholder="Your experience with homeonutri..." required></textarea>
                  </div>
                  <div class="col-12 text-center">
                    <button type="submit" class="btn btn-primary-custom">Submit Review</button>
                  </div>
                </form>
                <div id="reviewThanks" class="mt-3 text-success fw-bold d-none">Thank you! Your review is live!</div>
              </div>
            </div>`;

        document.querySelector('#testimonialsCarousel')?.insertAdjacentHTML('beforebegin', guestReviewHTML);

        // ===== 4. LOAD REVIEWS (Real-time) =====
        function loadReviews() {
            const carouselInner = document.querySelector('#testimonialsCarousel .carousel-inner');
            if (!carouselInner) return;

            carouselInner.innerHTML = '';

            onSnapshot(reviewsRef, (snapshot) => {
                const reviews = [];
                snapshot.forEach(d => reviews.push({ id: d.id, ...d.data() }));

                reviews.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

                if (reviews.length === 0) {
                    carouselInner.innerHTML = '<div class="text-center p-5"><p>No reviews yet. Be the first!</p></div>';
                    return;
                }

                for (let i = 0; i < reviews.length; i += 3) {
                    const slideReviews = reviews.slice(i, i + 3);
                    const activeClass = i === 0 ? 'active' : '';
                    const slideHTML = `
                      <div class="carousel-item ${activeClass}">
                        <div class="row g-4 justify-content-center">
                          ${slideReviews.map(r => `
                            <div class="col-md-4">
                              <div class="text-center p-4 bg-white rounded-4 shadow-sm position-relative" data-review-id="${r.id}">
                                <div class="mb-3">★★★★★</div>
                                <p class="fst-italic">"${r.text}"</p>
                                <p class="fw-bold mb-0">— ${r.name}</p>
                                ${isAdmin ? `
                                <div class="admin-actions position-absolute top-0 end-0 p-2 d-none">
                                  <button class="btn btn-sm btn-warning edit-review">✏️</button>
                                  <button class="btn btn-sm btn-danger delete-review">🗑️</button>
                                </div>` : ''}
                              </div>
                            </div>
                          `).join('')}
                        </div>
                      </div>`;
                    carouselInner.insertAdjacentHTML('beforeend', slideHTML);
                }

                if (isAdmin) {
                    document.querySelectorAll('.admin-actions').forEach(el => el.classList.remove('d-none'));
                }
            });
        }

        loadReviews();

        // ===== 5. GUEST SUBMIT REVIEW =====
        document.getElementById('guestReviewForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('guestName').value.trim();
            const text = document.getElementById('guestReviewText').value.trim();

            if (!name || !text) return alert("Please fill both fields");

            await addDoc(reviewsRef, {
                name,
                text,
                timestamp: serverTimestamp()
            });

            document.getElementById('guestReviewForm').reset();
            const thanks = document.getElementById('reviewThanks');
            thanks.classList.remove('d-none');
            setTimeout(() => thanks.classList.add('d-none'), 5000);
        });

        // ===== 6. CONTACT FORM → FIREBASE =====
        document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.timestamp = serverTimestamp();

            try {
                await addDoc(contactsRef, data);
                alert("Thank you! I'll get back to you soon 💚");
                e.target.reset();
            } catch (err) {
                alert("Oops! Something went wrong. Try again.");
                console.error(err);
            }
        });

        // ===== 7. ADMIN LOGIN =====
        document.getElementById('adminLoginBtn')?.addEventListener('click', () => {
            const user = document.getElementById('adminUsername').value.trim();
            const pass = document.getElementById('adminPassword').value;

            if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
                isAdmin = true;
                document.getElementById('loginOverlay')?.classList.add('d-none');
                document.getElementById('adminPanel')?.classList.remove('d-none');
                loadReviews();
            } else {
                document.getElementById('loginError')?.classList.remove('d-none');
            }
        });

        document.getElementById('guestBtn')?.addEventListener('click', () => {
            document.getElementById('loginOverlay')?.classList.add('d-none');
        });

        document.getElementById('adminLogoutBtn')?.addEventListener('click', () => {
            isAdmin = false;
            document.getElementById('adminPanel')?.classList.add('d-none');
            document.getElementById('loginOverlay')?.classList.remove('d-none');
            loadReviews();
        });

        // ===== 8. ADMIN: EDIT & DELETE =====
        document.addEventListener('click', async (e) => {
            if (!isAdmin) return;

            const card = e.target.closest('[data-review-id]');
            if (!card) return;

            if (e.target.classList.contains('delete-review')) {
                if (confirm('Delete this review?')) {
                    await deleteDoc(doc(db, "reviews", card.dataset.reviewId));
                }
            }

            if (e.target.classList.contains('edit-review')) {
                const currentText = card.querySelector('.fst-italic').textContent.slice(1, -1);
                const currentName = card.querySelector('.fw-bold').textContent.slice(2);
                const newText = prompt('Edit review:', currentText);
                const newName = prompt('Edit name:', currentName);
                if (newText !== null && newName !== null) {
                    await updateDoc(doc(db, "reviews", card.dataset.reviewId), {
                        text: newText.trim() || currentText,
                        name: newName.trim() || currentName
                    });
                }
            }
        });
    }

})();