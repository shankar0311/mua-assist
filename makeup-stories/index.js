/**
 * Makeup Stories by Rajeshwari - Interactive User Experience
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // Mobile navigation toggle
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.querySelector("#top-nav-bar nav");
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("hidden");
            navMenu.classList.toggle("flex");
            navMenu.classList.toggle("flex-col");
            navMenu.classList.toggle("absolute");
            navMenu.classList.toggle("top-full");
            navMenu.classList.toggle("left-0");
            navMenu.classList.toggle("w-full");
            navMenu.classList.toggle("bg-surface");
            navMenu.classList.toggle("p-6");
            navMenu.classList.toggle("border-b");
            navMenu.classList.toggle("border-outline-variant/20");
            navMenu.classList.toggle("gap-4");
        });

        // Close menu when clicking nav links
        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                if (!navMenu.classList.contains("hidden") && window.innerWidth < 768) {
                    navMenu.classList.add("hidden");
                    navMenu.classList.remove("flex", "flex-col", "absolute", "top-full", "left-0", "w-full", "bg-surface", "p-6", "border-b", "border-outline-variant/20", "gap-4");
                }
            });
        });
    }

    // ----------------------------------------------------------------------
    // 1. Setup Data & Portfolios
    // ----------------------------------------------------------------------
    const portfolioImages = [
        // --- Bridal Makeup (from xyz.png) ---
        {
            src: "images/bridal_1.webp",
            category: "bridal",
            title: "Royal Heritage Bridal Glam",
            desc: "Deep matte tones, elegant kohl eyes, and a classic crimson lip finish."
        },
        {
            src: "images/bridal_2.webp",
            category: "bridal",
            title: "Traditional Gold Inception",
            desc: "Luminous gold temple jewellery paired with a flawless traditional dewy glow."
        },
        {
            src: "images/bridal_3.webp",
            category: "bridal",
            title: "Classic South Indian Elegance",
            desc: "Timeless look featuring fresh flowers, traditional gold, and a warm bronze palette."
        },
        {
            src: "images/bridal_4.webp",
            category: "bridal",
            title: "Majestic Royal Amber Look",
            desc: "Flawless HD makeup highlighted by brilliant amber and traditional accents."
        },
        {
            src: "images/bridal_5.webp",
            category: "bridal",
            title: "Vintage Velvet Bridal Radiance",
            desc: "Elegant velvet base, soft contours, and a traditional crimson silk sari pairing."
        },
        {
            src: "images/bridal_6.webp",
            category: "bridal",
            title: "Luminous Silk Portrait",
            desc: "Sophisticated glowing dewy base adorned with emerald jewelry and soft kajal."
        },
        {
            src: "images/bridal_7.webp",
            category: "bridal",
            title: "Modern Traditionalist Glam",
            desc: "Soft contemporary glow blended with traditional temple borders."
        },
        {
            src: "images/bridal_8.webp",
            category: "bridal",
            title: "Imperial Crown Bridal Glow",
            desc: "Subtle rose gold highlights, dramatic eyes, and ornate crown jewel styling."
        },

        // --- Reception / Pre-Wedding (from xyz1.png) ---
        {
            src: "images/prewedding_1.webp",
            category: "prewedding",
            title: "Contemporary Pastel Reception",
            desc: "Soft blush tones, glittering pastel eyeshadow, and effortless waves."
        },
        {
            src: "images/prewedding_2.webp",
            category: "prewedding",
            title: "Elegant Ivory Pre-Wedding Glam",
            desc: "Luminous dewy decolletage glow with sleek styling for modern brides."
        },
        {
            src: "images/prewedding_3.webp",
            category: "prewedding",
            title: "Sunset Sangeet Radiance",
            desc: "Warm bronze highlights, sunset-tinted blush, and a bold celebratory lip."
        },
        {
            src: "images/prewedding_4.webp",
            category: "editorial",
            title: "High-Fashion Cocktail Editorial",
            desc: "Bold graphic liner, dewy glass skin, and a high-fashion structural silhouette."
        },
        {
            src: "images/prewedding_5.webp",
            category: "prewedding",
            title: "Classic Gold Hour Reception",
            desc: "Shimmering champagne eyes, soft kohl, and a romantic peach glow."
        },
        {
            src: "images/prewedding_6.webp",
            category: "prewedding",
            title: "Ethereal Dream Pre-Wedding Glow",
            desc: "Very light, weightless dewy finish with subtle pastel pink accents."
        },
        {
            src: "images/prewedding_7.webp",
            category: "editorial",
            title: "Sunset Celebration Campaign",
            desc: "Warm high-fashion bronze highlights with rich berry lips for a cinematic finish."
        },
        {
            src: "images/prewedding_8.webp",
            category: "editorial",
            title: "Modern Ivory Campaign Look",
            desc: "Glossy lips, sculpted cheekbones, and editorial pearl-beaded couture styling."
        }
    ];

    // Initialize gallery items dynamically
    const galleryGrid = document.getElementById("gallery-grid");
    if (galleryGrid) {
        galleryGrid.innerHTML = ""; // Clear placeholders
        portfolioImages.forEach((img, idx) => {
            const card = document.createElement("div");
            card.className = `gallery-item group relative overflow-hidden rounded-2xl shadow-md cursor-pointer hover:shadow-xl transition-all duration-500 ease-out-expo scroll-3d-entrance tilt-3d`;
            card.dataset.category = img.category;
            card.dataset.index = idx;
            card.style.transitionDelay = `${idx * 100}ms`;

            card.innerHTML = `
                <div class="tilt-3d-inner aspect-[4/5] w-full overflow-hidden relative">
                    <img src="${img.src}" alt="${img.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out-expo" loading="lazy" />
                    <!-- Ethereal Gold Overlay -->
                    <div class="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                        <span class="text-xs font-label-caps tracking-widest text-primary-fixed uppercase mb-2">${img.category}</span>
                        <h4 class="font-serif text-xl text-white mb-2">${img.title}</h4>
                        <p class="text-xs text-white/80">${img.desc}</p>
                    </div>
                </div>
            `;
            galleryGrid.appendChild(card);
        });
    }

    // ----------------------------------------------------------------------
    // 2. IntersectionObserver Fallbacks
    // ----------------------------------------------------------------------
    // Simple intersection observer for scroll-triggered fades
    const fadeInUpObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: "0px 0px -50px 0px"
    });

    document.querySelectorAll(".fade-in-up, .scroll-3d-entrance").forEach(el => {
        fadeInUpObserver.observe(el);
    });

    // JS Fallback for Parallax scrolling on browsers that lack native CSS scroll timeline
    if (!CSS.supports("(animation-timeline: view()) and (animation-range: entry)")) {
        const parallaxBg = document.getElementById("hero-parallax");
        if (parallaxBg) {
            window.addEventListener("scroll", () => {
                const scrolled = window.pageYOffset;
                // Move background at 30% of scroll speed
                parallaxBg.style.transform = `translateY(${scrolled * 0.3}px)`;
            }, { passive: true });
        }
    }

    // ----------------------------------------------------------------------
    // 3. Glam Portfolio Category Filters
    // ----------------------------------------------------------------------
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Update active state class on buttons
            filterButtons.forEach(b => {
                b.classList.remove("bg-primary", "text-on-primary");
                b.classList.add("bg-surface-container-high", "text-on-surface-variant");
            });
            btn.classList.remove("bg-surface-container-high", "text-on-surface-variant");
            btn.classList.add("bg-primary", "text-on-primary");

            const selectedCat = btn.dataset.filter;
            const items = document.querySelectorAll(".gallery-item");
            
            items.forEach(item => {
                const itemCat = item.dataset.category;
                if (selectedCat === "all" || itemCat === selectedCat) {
                    item.style.display = "block";
                    // Trigger reflow & re-animate
                    setTimeout(() => {
                        item.classList.add("visible");
                        item.style.opacity = "1";
                        item.style.transform = "scale(1)";
                    }, 50);
                } else {
                    item.style.opacity = "0";
                    item.style.transform = "scale(0.95)";
                    setTimeout(() => {
                        item.style.display = "none";
                    }, 350);
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 4. Portfolio Fullscreen Lightbox
    // ----------------------------------------------------------------------
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxDesc = document.getElementById("lightbox-desc");
    const lightboxClose = document.getElementById("lightbox-close");
    const lightboxPrev = document.getElementById("lightbox-prev");
    const lightboxNext = document.getElementById("lightbox-next");
    let currentIdx = 0;

    function openLightbox(idx) {
        currentIdx = parseInt(idx);
        const data = portfolioImages[currentIdx];
        if (data && lightbox && lightboxImg) {
            lightboxImg.src = data.src;
            if (lightboxTitle) lightboxTitle.textContent = data.title;
            if (lightboxDesc) lightboxDesc.textContent = data.desc;
            lightbox.classList.remove("hidden");
            lightbox.classList.add("flex");
            document.body.style.overflow = "hidden"; // Freeze scroll
        }
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove("flex");
            lightbox.classList.add("hidden");
            document.body.style.overflow = ""; // Thaw scroll
        }
    }

    function showPrevImage() {
        currentIdx = (currentIdx - 1 + portfolioImages.length) % portfolioImages.length;
        openLightbox(currentIdx);
    }

    function showNextImage() {
        currentIdx = (currentIdx + 1) % portfolioImages.length;
        openLightbox(currentIdx);
    }

    // Attach click events to dynamic gallery items
    if (galleryGrid) {
        galleryGrid.addEventListener("click", (e) => {
            const item = e.target.closest(".gallery-item");
            if (item) {
                openLightbox(item.dataset.index);
            }
        });
    }

    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener("click", showPrevImage);
    if (lightboxNext) lightboxNext.addEventListener("click", showNextImage);

    // Close lightbox on backdrop click
    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox || e.target.id === "lightbox-overlay-container") {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation for lightbox
    document.addEventListener("keydown", (e) => {
        if (lightbox && !lightbox.classList.contains("hidden")) {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") showPrevImage();
            if (e.key === "ArrowRight") showNextImage();
        }
    });

    // ----------------------------------------------------------------------
    // 5. Testimonials Review Slider / Carousel
    // ----------------------------------------------------------------------
    const carouselTrack = document.getElementById("carousel-track");
    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");
    const carouselDots = document.getElementById("carousel-dots");
    
    if (carouselTrack) {
        const slides = Array.from(carouselTrack.children);
        let activeSlideIdx = 0;

        function updateCarousel() {
            const slideWidth = slides[0].getBoundingClientRect().width || carouselTrack.clientWidth;
            
            // 3D Testimonial Slide placements
            slides.forEach((slide, idx) => {
                slide.classList.remove("active", "prev", "next");
                if (idx === activeSlideIdx) {
                    slide.classList.add("active");
                } else if (idx === (activeSlideIdx - 1 + slides.length) % slides.length) {
                    slide.classList.add("prev");
                } else if (idx === (activeSlideIdx + 1) % slides.length) {
                    slide.classList.add("next");
                }
            });

            carouselTrack.style.transform = `translateX(-${activeSlideIdx * (slideWidth + 32)}px)`; // 32px is gap-8
            
            // Update dots
            if (carouselDots) {
                const dots = Array.from(carouselDots.children);
                dots.forEach((dot, idx) => {
                    if (idx === activeSlideIdx) {
                        dot.classList.remove("bg-outline-variant", "w-2");
                        dot.classList.add("bg-primary", "w-6");
                    } else {
                        dot.classList.remove("bg-primary", "w-6");
                        dot.classList.add("bg-outline-variant", "w-2");
                    }
                });
            }
        }

        // Initialize dots dynamically based on child count
        if (carouselDots) {
            carouselDots.innerHTML = "";
            slides.forEach((_, idx) => {
                const dot = document.createElement("button");
                dot.ariaLabel = `Go to review slide ${idx + 1}`;
                dot.className = `h-2 rounded-full transition-all duration-300 ${idx === 0 ? 'bg-primary w-6' : 'bg-outline-variant w-2'}`;
                dot.addEventListener("click", () => {
                    activeSlideIdx = idx;
                    updateCarousel();
                });
                carouselDots.appendChild(dot);
            });
        }

        updateCarousel(); // Initial 3D state trigger

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                activeSlideIdx = (activeSlideIdx + 1) % slides.length;
                updateCarousel();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                activeSlideIdx = (activeSlideIdx - 1 + slides.length) % slides.length;
                updateCarousel();
            });
        }

        // Resize handler to adjust slide positions
        window.addEventListener("resize", updateCarousel);
    }

    // ----------------------------------------------------------------------
    // 6. Interactive Multi-Step Slot Booking Pipeline (Luxury Bridal Concierge)
    // ----------------------------------------------------------------------
    const bookingModal = document.getElementById("booking-modal");
    const openBookingBtns = document.querySelectorAll("a[href='#contact'], a[href='#booking']");
    const closeBookingBtn = document.getElementById("close-booking");
    
    // Webhook configuration fallback
    const N8N_WEBHOOK_URL = "https://shankar0311.app.n8n.cloud/webhook/mua-booking-inquiry";
    const WHATSAPP_CONTACT_NUMBER = "917625035253";

    // Setup Local Concierge State
    let bookingState = {
        brideName: "",
        phone: "",
        email: "",
        city: "",
        weddingVenue: "",
        contactMethod: "WhatsApp",
        events: [
            {
                eventType: "Wedding",
                date: "",
                time: "06:00",
                makeupStyle: "HD Makeup",
                addons: []
            }
        ]
    };

    const EVENT_TYPES = [
        { value: "Wedding", label: "Wedding Ceremony" },
        { value: "Reception", label: "Reception" },
        { value: "Engagement", label: "Engagement / Ring Exchange" },
        { value: "Mehendi", label: "Mehendi Ceremony" },
        { value: "Haldi", label: "Haldi / Turmeric Ceremony" },
        { value: "Sangeet", label: "Sangeet Night" },
        { value: "Vratham", label: "Vratham Ceremony" },
        { value: "Seemantha", label: "Baby Shower / Seemantha" },
        { value: "Fashion Shoot", label: "Fashion / Portfolio Shoot" },
        { value: "Party Makeup", label: "Party / Guest Makeup" },
        { value: "Editorial Shoot", label: "Editorial Campaign" },
        { value: "Other", label: "Other Ceremonial Event" }
    ];

    const MAKEUP_STYLES = [
        { value: "HD Makeup", label: "HD Makeup" },
        { value: "Semi HD Makeup", label: "Semi HD Makeup" },
        { value: "Non-Bridal Makeup", label: "Non-Bridal Makeup" }
    ];

    const ADDON_FAMILY = [
        { id: "mother", label: "Mother's Makeup", price: 4000 },
        { id: "sister", label: "Sister's Makeup", price: 4000 },
        { id: "bridesmaid", label: "Bridesmaid's Makeup", price: 3500 },
        { id: "groom", label: "Groom's Grooming", price: 3000 },
        { id: "groom_touchup", label: "Groom Touch-up Assistance", price: 1500 },
        { id: "reception_touchup", label: "Reception Quick Touch-up", price: 2000 },
        { id: "saree_draping", label: "Saree Draping / Pleating", price: 1000 },
        { id: "hairstyling", label: "Guest Hairstyling", price: 1500 }
    ];

    const ADDON_PREMIUM = [
        { id: "airbrush", label: "Airbrush Upgrade", price: 5000 },
        { id: "full_day", label: "Full Day Concierge Assistance", price: 10000 },
        { id: "touchup_kit", label: "Premium Bridal Touch-up Kit", price: 2500 },
        { id: "add_hairstyling", label: "Additional Hair Extension & Styling", price: 2000 },
        { id: "look_change", label: "Look Change / Dupatta Re-draping", price: 3000 },
        { id: "travel_support", label: "Outstation Travel Support", price: 6000 }
    ];

    function resetBookingForm() {
        bookingState = {
            brideName: "",
            phone: "",
            email: "",
            city: "",
            weddingVenue: "",
            contactMethod: "WhatsApp",
            events: [
                {
                    eventType: "Wedding",
                    date: "",
                    time: "06:00",
                    makeupStyle: "HD Makeup",
                    addons: []
                }
            ]
        };

        // Reset inputs
        document.getElementById("bride-name").value = "";
        document.getElementById("bride-phone").value = "";
        document.getElementById("bride-email").value = "";
        document.getElementById("bride-city").value = "";
        document.getElementById("bride-venue").value = "";

        // Reset errors
        document.querySelectorAll("#booking-modal [id^='err-']").forEach(el => {
            el.textContent = "";
            el.classList.add("hidden");
        });

        // Reset Contact Method visually
        const contactBtns = document.querySelectorAll(".contact-method-btn");
        contactBtns.forEach(btn => {
            if (btn.dataset.method === "WhatsApp") {
                btn.classList.add("border-primary", "bg-primary/5", "text-primary");
                btn.classList.remove("border-outline-variant", "bg-transparent", "text-on-surface");
            } else {
                btn.classList.remove("border-primary", "bg-primary/5", "text-primary");
                btn.classList.add("border-outline-variant", "bg-transparent", "text-on-surface");
            }
        });

        goToStep(1);
    }

    function openBookingModal(e) {
        if (e) e.preventDefault();
        if (bookingModal) {
            resetBookingForm();
            bookingModal.classList.remove("hidden");
            bookingModal.classList.add("flex");
            document.body.style.overflow = "hidden"; // Freeze scroll
        }
    }

    function closeBookingModal() {
        if (bookingModal) {
            bookingModal.classList.remove("flex");
            bookingModal.classList.add("hidden");
            document.body.style.overflow = ""; // Thaw scroll
        }
    }

    // Attach click events to open triggers
    openBookingBtns.forEach(btn => {
        btn.addEventListener("click", openBookingModal);
    });

    if (closeBookingBtn) closeBookingBtn.addEventListener("click", closeBookingModal);

    // Close modal on escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && bookingModal && !bookingModal.classList.contains("hidden")) {
            closeBookingModal();
        }
    });

    // Step navigation helper
    function goToStep(stepNum) {
        document.getElementById("booking-step-1").classList.add("hidden");
        document.getElementById("booking-step-2").classList.add("hidden");
        document.getElementById("booking-step-3").classList.add("hidden");
        document.getElementById("booking-step-loading").classList.add("hidden");
        document.getElementById("booking-step-success").classList.add("hidden");

        const progressHeader = document.querySelector("#booking-modal .mb-6");

        if (stepNum === 1) {
            document.getElementById("booking-step-1").classList.remove("hidden");
            document.getElementById("step-label").textContent = "Step 1 of 3";
            document.getElementById("step-title").textContent = "Bride Details";
            document.getElementById("progress-bar").style.width = "33.33%";
            if (progressHeader) progressHeader.classList.remove("hidden");
        } else if (stepNum === 2) {
            document.getElementById("booking-step-2").classList.remove("hidden");
            document.getElementById("step-label").textContent = "Step 2 of 3";
            document.getElementById("step-title").textContent = "Wedding Events";
            document.getElementById("progress-bar").style.width = "66.66%";
            if (progressHeader) progressHeader.classList.remove("hidden");
            renderEvents();
        } else if (stepNum === 3) {
            document.getElementById("booking-step-3").classList.remove("hidden");
            document.getElementById("step-label").textContent = "Step 3 of 3";
            document.getElementById("step-title").textContent = "Summary Review";
            document.getElementById("progress-bar").style.width = "100%";
            if (progressHeader) progressHeader.classList.remove("hidden");
            renderSummary();
        } else if (stepNum === 4) {
            document.getElementById("booking-step-loading").classList.remove("hidden");
            if (progressHeader) progressHeader.classList.add("hidden");
        } else if (stepNum === 5) {
            document.getElementById("booking-step-success").classList.remove("hidden");
            if (progressHeader) progressHeader.classList.add("hidden");
        }

        // Scroll modal to top
        const modalContainer = document.querySelector("#booking-modal > div");
        if (modalContainer) modalContainer.scrollTop = 0;

        // Dynamic 3D step transitions
        const stepId = stepNum === 4 ? "loading" : stepNum === 5 ? "success" : stepNum;
        const activeStepEl = document.getElementById(`booking-step-${stepId}`);
        if (activeStepEl) {
            activeStepEl.classList.remove("step-transition-3d");
            void activeStepEl.offsetWidth; // trigger reflow
            activeStepEl.classList.add("step-transition-3d");
        }
    }

    // Step 1: Radio selection contact buttons
    const contactBtns = document.querySelectorAll(".contact-method-btn");
    contactBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            contactBtns.forEach(b => {
                b.classList.remove("border-primary", "bg-primary/5", "text-primary");
                b.classList.add("border-outline-variant", "bg-transparent", "text-on-surface");
            });
            btn.classList.remove("border-outline-variant", "bg-transparent", "text-on-surface");
            btn.classList.add("border-primary", "bg-primary/5", "text-primary");
            bookingState.contactMethod = btn.dataset.method;
        });
    });

    // Step 1: Validation and move to Step 2
    const toStep2 = document.getElementById("next-to-step-2");
    if (toStep2) {
        toStep2.addEventListener("click", () => {
            let isValid = true;

            const name = document.getElementById("bride-name").value.trim();
            const phone = document.getElementById("bride-phone").value.trim();
            const email = document.getElementById("bride-email").value.trim();
            const city = document.getElementById("bride-city").value.trim();
            const venue = document.getElementById("bride-venue").value.trim();

            // Clear errors
            document.querySelectorAll("#booking-modal [id^='err-']").forEach(el => {
                el.textContent = "";
                el.classList.add("hidden");
            });

            if (!name) {
                showError("err-bride-name", "We need your beautiful name to open your file ✨");
                isValid = false;
            }
            if (!phone) {
                showError("err-bride-phone", "Your contact number is vital for WhatsApp confirmations 📱");
                isValid = false;
            } else if (phone.length < 8) {
                showError("err-bride-phone", "Please enter a valid phone number");
                isValid = false;
            }
            if (!email) {
                showError("err-bride-email", "An email is required to send your calendar summary 💌");
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showError("err-bride-email", "Please enter a valid email format");
                isValid = false;
            }
            if (!city) {
                showError("err-bride-city", "City name is required");
                isValid = false;
            }
            if (!venue) {
                showError("err-bride-venue", "Please specify the venue to calculate travel schedules");
                isValid = false;
            }

            if (isValid) {
                bookingState.brideName = name;
                bookingState.phone = phone;
                bookingState.email = email;
                bookingState.city = city;
                bookingState.weddingVenue = venue;
                goToStep(2);
            }
        });
    }

    function showError(id, message) {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = message;
            el.classList.remove("hidden");
        }
    }

    // Step 2 buttons
    const backToStep1 = document.getElementById("back-to-step-1");
    if (backToStep1) backToStep1.addEventListener("click", () => goToStep(1));

    const addAnotherEventBtn = document.getElementById("add-another-event-btn");
    if (addAnotherEventBtn) {
        addAnotherEventBtn.addEventListener("click", () => {
            bookingState.events.push({
                eventType: "Wedding",
                date: "",
                time: "06:00",
                makeupStyle: "HD Makeup",
                addons: []
            });
            renderEvents();
        });
    }

    const toStep3 = document.getElementById("next-to-step-3");
    if (toStep3) {
        toStep3.addEventListener("click", () => {
            let isValid = true;
            
            // Validate all events
            for (let i = 0; i < bookingState.events.length; i++) {
                const evt = bookingState.events[i];
                if (!evt.date) {
                    alert(`Please choose a beautiful date for event #${i + 1} (${evt.eventType}) 💖`);
                    isValid = false;
                    break;
                }
                if (!evt.time) {
                    alert(`Please select a preferred start time for event #${i + 1} (${evt.eventType}) ⏰`);
                    isValid = false;
                    break;
                }
            }

            if (isValid) {
                goToStep(3);
            }
        });
    }

    // Step 3 buttons
    const backToStep2 = document.getElementById("back-to-step-2");
    if (backToStep2) backToStep2.addEventListener("click", () => goToStep(2));

    const summaryWhatsAppBtn = document.getElementById("summary-whatsapp-chat");
    if (summaryWhatsAppBtn) {
        summaryWhatsAppBtn.addEventListener("click", openDirectWhatsApp);
    }

    const submitBookingBtn = document.getElementById("submit-booking");
    if (submitBookingBtn) {
        submitBookingBtn.addEventListener("click", async () => {
            goToStep(4); // Loader

            const generatedId = `MUA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
            const payload = {
                inquiryId: generatedId,
                submittedAt: new Date().toISOString(),
                brideName: bookingState.brideName,
                phone: bookingState.phone,
                email: bookingState.email,
                city: bookingState.city,
                weddingVenue: bookingState.weddingVenue,
                contactMethod: bookingState.contactMethod,
                events: bookingState.events
            };

            try {
                // Fetch request to dispatch the JSON payload to n8n endpoint
                await fetch(N8N_WEBHOOK_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
            } catch (err) {
                console.error("n8n webhook error (continuing dynamically):", err);
            }

            // Simulated wait for checking calendar slots
            setTimeout(() => {
                // Populate Success Card values if elements exist
                const elReceipt = document.getElementById("success-receipt-id");
                if (elReceipt) elReceipt.textContent = generatedId;

                const elName = document.getElementById("success-name");
                if (elName) elName.textContent = bookingState.brideName;

                const elVenue = document.getElementById("success-venue");
                if (elVenue) elVenue.textContent = bookingState.weddingVenue;

                const responsePathEl = document.getElementById("success-contact-method");
                if (responsePathEl) {
                    responsePathEl.textContent = bookingState.contactMethod;
                }

                // Dynamically render event timings list
                const timingsListEl = document.getElementById("success-timings-list");
                if (timingsListEl) {
                    timingsListEl.innerHTML = "";
                    bookingState.events.forEach((evt) => {
                        const div = document.createElement("div");
                        div.className = "flex justify-between items-center text-xs";
                        div.innerHTML = `
                            <span class="font-serif font-bold text-on-surface">${evt.eventType}</span>
                            <span class="font-mono text-outline font-semibold">${evt.date} at ${evt.time}</span>
                        `;
                        timingsListEl.appendChild(div);
                    });
                }

                goToStep(5); // Success Screen
            }, 2200);
        });
    }

    const successSubmitAnother = document.getElementById("success-submit-another");
    if (successSubmitAnother) {
        successSubmitAnother.addEventListener("click", () => {
            resetBookingForm();
        });
    }

    function openDirectWhatsApp() {
        const name = bookingState.brideName || "Bride";
        const city = bookingState.city || "Bangalore";
        const msg = `Hi Rajeshwari ✨, I am ${name} from ${city}. I would like to inquire about luxury bridal makeup packages and date availability! 💖`;
        window.open(`https://wa.me/${WHATSAPP_CONTACT_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
    }

    // Floating WhatsApp Badge click link sync
    const floatingWhatsApp = document.getElementById("floating-whatsapp");
    if (floatingWhatsApp) {
        floatingWhatsApp.addEventListener("click", (e) => {
            e.preventDefault();
            openDirectWhatsApp();
        });
    }

    // Dynamic rendering implementation
    function renderEvents() {
        const container = document.getElementById("dynamic-events-container");
        if (!container) return;
        container.innerHTML = "";

        bookingState.events.forEach((evt, idx) => {
            const card = document.createElement("div");
            card.className = "border border-outline-variant/50 bg-white shadow-lg rounded-2xl overflow-hidden animate-card-entry text-left";
            card.dataset.index = idx;

            const getAddonQuantity = (addonId) => {
                const add = evt.addons.find(a => a.id === addonId);
                return add ? add.quantity : 0;
            };

            let eventOptionsHtml = EVENT_TYPES.map(opt => 
                `<option value="${opt.value}" ${evt.eventType === opt.value ? 'selected' : ''}>${opt.label}</option>`
            ).join("");

            let styleOptionsHtml = MAKEUP_STYLES.map(opt => 
                `<option value="${opt.value}" ${evt.makeupStyle === opt.value ? 'selected' : ''}>${opt.label}</option>`
            ).join("");

            card.innerHTML = `
                <header class="bg-surface-container-high px-6 py-4 flex items-center justify-between border-b border-outline-variant/30 select-none">
                    <div class="flex items-center gap-3">
                        <span class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold font-serif text-sm">
                            ${idx + 1}
                        </span>
                        <h4 class="font-serif font-bold text-lg text-on-surface">
                            ${evt.eventType || "Event"} Glam
                        </h4>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <button type="button" class="duplicate-event-btn p-2 text-outline hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-300 flex items-center justify-center" title="Duplicate Event Card" data-index="${idx}">
                            <span class="material-symbols-outlined" style="font-size: 20px;">content_copy</span>
                        </button>
                        ${bookingState.events.length > 1 ? `
                        <button type="button" class="remove-event-btn p-2 text-error hover:bg-error/5 rounded-full transition-all duration-300 flex items-center justify-center" title="Remove Event" data-index="${idx}">
                            <span class="material-symbols-outlined" style="font-size: 20px;">delete</span>
                        </button>
                        ` : ''}
                    </div>
                </header>

                <div class="p-6 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label class="block text-xs font-semibold uppercase text-outline mb-1.5 ml-1">Event Session Type</label>
                           <select class="event-type-select w-full rounded-xl border-outline-variant p-4 bg-white text-on-surface focus:border-primary focus:ring-primary shadow-sm" data-index="${idx}">
                               ${eventOptionsHtml}
                           </select>
                        </div>
                        <div>
                           <label class="block text-xs font-semibold uppercase text-outline mb-1.5 ml-1">Preferred Makeup Style</label>
                           <select class="makeup-style-select w-full rounded-xl border-outline-variant p-4 bg-white text-on-surface focus:border-primary focus:ring-primary shadow-sm" data-index="${idx}">
                               ${styleOptionsHtml}
                           </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label class="block text-xs font-semibold uppercase text-outline mb-1.5 ml-1">Event Date</label>
                           <div class="relative">
                               <input type="date" class="event-date-input w-full rounded-xl border-outline-variant p-4 pr-12 bg-white text-on-surface focus:border-primary focus:ring-primary shadow-sm" data-index="${idx}" value="${evt.date || ''}" required />
                               <span class="material-symbols-outlined absolute right-4 top-4 text-outline/60 pointer-events-none">calendar_today</span>
                           </div>
                        </div>

                        <div>
                           <label class="block text-xs font-semibold uppercase text-outline mb-1.5 ml-1">Start Time</label>
                           <div class="relative">
                               <input type="time" class="event-time-input w-full rounded-xl border-outline-variant p-4 pr-12 bg-white text-on-surface focus:border-primary focus:ring-primary shadow-sm" data-index="${idx}" value="${evt.time || '06:00'}" required />
                               <span class="material-symbols-outlined absolute right-4 top-4 text-outline/60 pointer-events-none">schedule</span>
                           </div>
                        </div>
                    </div>

                    <!-- Interactive Addon System -->
                    <div class="pt-6 border-t border-outline-variant/30 space-y-4">
                        <div class="flex items-center gap-2">
                           <span class="material-symbols-outlined text-primary text-xl">sparkles</span>
                           <h5 class="font-serif font-bold text-on-surface">Customize Add-ons for this Event</h5>
                        </div>

                        <!-- Family Makeup Addons -->
                        <div class="space-y-3">
                           <span class="text-[10px] font-bold uppercase tracking-wider text-outline block">Family &amp; Guest Makeup</span>
                           <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                               ${ADDON_FAMILY.map(addon => {
                                   const qty = getAddonQuantity(addon.id);
                                   const isSel = qty > 0;
                                   return `
                                   <div class="p-3 border flex items-center justify-between transition-all duration-300 rounded-xl ${
                                       isSel 
                                           ? "border-primary bg-primary/5" 
                                           : "border-outline-variant/60 bg-transparent hover:border-outline-variant"
                                   }">
                                        <div class="text-left select-none flex items-center h-12">
                                            <h6 class="font-semibold text-sm text-on-surface leading-tight">${addon.label}</h6>
                                        </div>
                                       
                                       <div class="flex items-center gap-2.5 bg-white/80 rounded-full border border-outline-variant/50 p-1 shadow-sm select-none">
                                           <button type="button" class="addon-qty-btn w-11 h-11 rounded-full bg-surface-container-high hover:bg-outline-variant/40 text-on-surface flex items-center justify-center font-extrabold active:scale-90 transition-transform text-lg" data-index="${idx}" data-addon-id="${addon.id}" data-category="family" data-price="${addon.price}" data-label="${addon.label}" data-delta="-1">-</button>
                                           <span class="font-mono text-sm font-bold w-6 text-center">${qty}</span>
                                           <button type="button" class="addon-qty-btn w-11 h-11 rounded-full bg-surface-container-high hover:bg-outline-variant/40 text-on-surface flex items-center justify-center font-extrabold active:scale-90 transition-transform text-lg" data-index="${idx}" data-addon-id="${addon.id}" data-category="family" data-price="${addon.price}" data-label="${addon.label}" data-delta="1">+</button>
                                       </div>
                                   </div>
                                   `;
                               }).join("")}
                           </div>
                        </div>

                        <!-- Premium Services Addons -->
                        <div class="space-y-3 pt-3">
                           <span class="text-[10px] font-bold uppercase tracking-wider text-outline block">Premium Bridal Add-ons</span>
                           <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                               ${ADDON_PREMIUM.map(addon => {
                                   const qty = getAddonQuantity(addon.id);
                                   const isSel = qty > 0;
                                   return `
                                   <div class="p-3 border flex items-center justify-between transition-all duration-300 rounded-xl ${
                                       isSel 
                                           ? "border-primary bg-primary/5" 
                                           : "border-outline-variant/60 bg-transparent hover:border-outline-variant"
                                   }">
                                        <div class="text-left select-none flex items-center h-12">
                                            <h6 class="font-semibold text-sm text-on-surface leading-tight">${addon.label}</h6>
                                        </div>
                                       
                                       <div class="flex items-center gap-2.5 bg-white/80 rounded-full border border-outline-variant/50 p-1 shadow-sm select-none">
                                           <button type="button" class="addon-qty-btn w-11 h-11 rounded-full bg-surface-container-high hover:bg-outline-variant/40 text-on-surface flex items-center justify-center font-extrabold active:scale-90 transition-transform text-lg" data-index="${idx}" data-addon-id="${addon.id}" data-category="premium" data-price="${addon.price}" data-label="${addon.label}" data-delta="-1">-</button>
                                           <span class="font-mono text-sm font-bold w-6 text-center">${qty}</span>
                                           <button type="button" class="addon-qty-btn w-11 h-11 rounded-full bg-surface-container-high hover:bg-outline-variant/40 text-on-surface flex items-center justify-center font-extrabold active:scale-90 transition-transform text-lg" data-index="${idx}" data-addon-id="${addon.id}" data-category="premium" data-price="${addon.price}" data-label="${addon.label}" data-delta="1">+</button>
                                       </div>
                                   </div>
                                   `;
                               }).join("")}
                           </div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        bindCardListeners();
    }

    function bindCardListeners() {
        document.querySelectorAll(".duplicate-event-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.dataset.index);
                const srcEvent = bookingState.events[idx];
                if (srcEvent) {
                    bookingState.events.push({
                        eventType: srcEvent.eventType,
                        date: srcEvent.date,
                        time: srcEvent.time,
                        makeupStyle: srcEvent.makeupStyle,
                        addons: JSON.parse(JSON.stringify(srcEvent.addons))
                    });
                    renderEvents();
                }
            });
        });

        document.querySelectorAll(".remove-event-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.dataset.index);
                bookingState.events.splice(idx, 1);
                renderEvents();
            });
        });

        document.querySelectorAll(".event-type-select").forEach(select => {
            select.addEventListener("change", () => {
                const idx = parseInt(select.dataset.index);
                bookingState.events[idx].eventType = select.value;
                const titleEl = select.closest(".border").querySelector("h4");
                if (titleEl) titleEl.textContent = `${select.value} Glam`;
            });
        });

        document.querySelectorAll(".makeup-style-select").forEach(select => {
            select.addEventListener("change", () => {
                const idx = parseInt(select.dataset.index);
                bookingState.events[idx].makeupStyle = select.value;
            });
        });

        document.querySelectorAll(".event-date-input").forEach(input => {
            input.addEventListener("input", () => {
                const idx = parseInt(input.dataset.index);
                bookingState.events[idx].date = input.value;
            });
        });

        document.querySelectorAll(".event-time-input").forEach(input => {
            input.addEventListener("input", () => {
                const idx = parseInt(input.dataset.index);
                bookingState.events[idx].time = input.value;
            });
        });

        document.querySelectorAll(".addon-qty-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const eventIdx = parseInt(btn.dataset.index);
                const addonId = btn.dataset.addonId;
                const addonLabel = btn.dataset.label;
                const category = btn.dataset.category;
                const price = parseInt(btn.dataset.price);
                const delta = parseInt(btn.dataset.delta);

                const eventItem = bookingState.events[eventIdx];
                const currentAddons = eventItem.addons;
                const existingIdx = currentAddons.findIndex(a => a.id === addonId);

                if (existingIdx > -1) {
                    const newQty = currentAddons[existingIdx].quantity + delta;
                    if (newQty <= 0) {
                        currentAddons.splice(existingIdx, 1);
                    } else {
                        currentAddons[existingIdx].quantity = newQty;
                    }
                } else if (delta > 0) {
                    currentAddons.push({
                        id: addonId,
                        name: addonLabel,
                        category,
                        quantity: 1,
                        price
                    });
                }

                renderEvents();
            });
        });
    }

    function renderSummary() {
        document.getElementById("summary-bride-name").textContent = bookingState.brideName;
        document.getElementById("summary-bride-venue").textContent = `${bookingState.weddingVenue} (${bookingState.city})`;
        document.getElementById("summary-bride-contact").textContent = `${bookingState.phone} • ${bookingState.email}`;
        document.getElementById("summary-bride-method").textContent = bookingState.contactMethod;

        const listContainer = document.getElementById("summary-events-list");
        if (!listContainer) return;
        listContainer.innerHTML = "";

        bookingState.events.forEach((evt, idx) => {
            const item = document.createElement("div");
            item.className = "bg-surface-container-low rounded-xl p-4 border border-outline-variant/30 space-y-3 text-left";

            let addonsHtml = "";
            if (evt.addons && evt.addons.length > 0) {
                const pills = evt.addons.map(add => 
                    `<span class="text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full select-none">${add.name} (x${add.quantity})</span>`
                ).join("");
                addonsHtml = `
                    <div class="space-y-1 select-none">
                        <span class="text-[9px] uppercase tracking-wider font-bold text-outline block">Selected Add-ons:</span>
                        <div class="flex flex-wrap gap-1.5">${pills}</div>
                    </div>
                `;
            } else {
                addonsHtml = `<span class="text-[10px] italic text-outline block">No guest addons or upgrades chosen.</span>`;
            }

            item.innerHTML = `
                <div class="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                    <span class="font-serif font-bold text-on-surface text-sm">
                        ${idx + 1}. ${evt.eventType} (${evt.makeupStyle})
                    </span>
                    <span class="font-mono text-xs font-semibold bg-white text-on-surface px-2.5 py-0.5 rounded border border-outline-variant/30">
                        ${evt.date} at ${evt.time}
                    </span>
                </div>
                ${addonsHtml}
            `;
            listContainer.appendChild(item);
        });
    }

    // ----------------------------------------------------------------------
    // 7. Immersive 3D Parallax & Cursor-reactive system
    // ----------------------------------------------------------------------
    function init3DTilt() {
        const tiltCards = document.querySelectorAll(".tilt-3d");
        tiltCards.forEach(card => {
            if (card.dataset.tiltBound) return;
            card.dataset.tiltBound = "true";

            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Rotations mapped to client offset
                const rotateX = ((centerY - y) / centerY) * 10; // max 10deg
                const rotateY = ((x - centerX) / centerX) * 10;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

                // Inner elements translation (depth floating)
                const inner = card.querySelector(".tilt-3d-inner");
                if (inner) {
                    const dx = ((x - centerX) / centerX) * 6; // max 6px shift
                    const dy = ((y - centerY) / centerY) * 6;
                    inner.style.transform = `translate3d(${dx}px, ${dy}px, 35px)`;
                }
            });

            card.addEventListener("mouseleave", () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                const inner = card.querySelector(".tilt-3d-inner");
                if (inner) {
                    inner.style.transform = "translate3d(0px, 0px, 0px)";
                }
            });
        });
    }

    // Hero Background Ambient Blobs Mouse Parallax
    function initAmbientBlobsParallax() {
        const hero = document.getElementById("hero");
        const blob1 = document.getElementById("hero-blob-1");
        const blob2 = document.getElementById("hero-blob-2");

        if (hero && blob1 && blob2) {
            hero.addEventListener("mousemove", (e) => {
                const rect = hero.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                // Inverse drift direction to create 3D visual depth
                blob1.style.transform = `translate3d(${x * 45}px, ${y * 45}px, 0)`;
                blob2.style.transform = `translate3d(${x * -65}px, ${y * -65}px, 0)`;
            });
        }
    }

    // Hero 3D Title Letter Splitting Reveal
    function initHero3DEntrance() {
        const heroTitle = document.querySelector("#hero h1");
        if (heroTitle) {
            const originalHtml = heroTitle.innerHTML;
            const lines = originalHtml.split(/<br\s*\/?>/i);
            let newHtml = "";

            lines.forEach((line, lineIdx) => {
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = line;
                const children = Array.from(tempDiv.childNodes);

                children.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent;
                        const words = text.split(" ");
                        words.forEach((word, wordIdx) => {
                            if (!word.trim()) return;
                            newHtml += `<span class="hero-title-word">`;
                            Array.from(word).forEach((letter, letterIdx) => {
                                const delay = (lineIdx * 10 + wordIdx * 3 + letterIdx) * 35;
                                newHtml += `<span class="hero-title-letter" style="animation-delay: ${delay}ms">${letter}</span>`;
                            });
                            newHtml += `</span> `;
                        });
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const tag = node.tagName.toLowerCase();
                        const classes = node.className;
                        const text = node.textContent;
                        const words = text.split(" ");
                        
                        // Keep a single element container
                        newHtml += `<${tag} class="${classes}">`;
                        
                        let letterCounter = 0;
                        words.forEach((word, wordIdx) => {
                            if (!word.trim()) return;
                            newHtml += `<span class="hero-title-word whitespace-nowrap">`;
                            Array.from(word).forEach((letter) => {
                                const delay = (lineIdx * 10 + wordIdx * 3 + letterCounter) * 35 + 150;
                                newHtml += `<span class="hero-title-letter" style="animation-delay: ${delay}ms">${letter}</span>`;
                                letterCounter++;
                            });
                            newHtml += `</span>`;
                            if (wordIdx < words.length - 1) {
                                newHtml += " "; // space between words inside element
                            }
                        });
                        
                        newHtml += `</${tag}>`;
                    }
                });

                if (lineIdx < lines.length - 1) {
                    newHtml += "<br/>";
                }
            });
            heroTitle.innerHTML = newHtml;
        }
    }

    // Initialize 3D Engine & Triggers
    initHero3DEntrance();
    initAmbientBlobsParallax();
    init3DTilt();

    // Re-initialize tilt binding when events are dynamically injected into booking cards
    const originalRenderEvents = renderEvents;
    renderEvents = function() {
        originalRenderEvents();
        setTimeout(init3DTilt, 50); // Bind to dynamic cards
    };
});
