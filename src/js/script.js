// Siluet — Premium Tiffany Styled JavaScript
(() => {
  'use strict';

  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  
  // ===== ОСНОВНЫЕ ЭЛЕМЕНТЫ =====
  const header = $('.header');
  const burger = $('#burger');
  const mobileMenu = $('#mobileMenu');
  const themeToggle = $('#themeToggle');
  const toTop = $('#toTop');
  const yearElement = $('#year');
  
  // ===== ИНИЦИАЛИЗАЦИЯ =====
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileMenu();
    initSmoothScroll();
    initActiveNav();
    initPriceModal();
    initBookingModal();
    initToTopButton();
    initParallax();
    initRevealAnimations();
    initFormMasks();
    
    // Установка года в футере
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  });
  
  // ===== ТЕМНАЯ ТЕМА =====
  function initTheme() {
    const savedTheme = localStorage.getItem('silhouette_theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
      themeToggle?.setAttribute('aria-pressed', 'true');
    }
    
    themeToggle?.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      localStorage.setItem('silhouette_theme', isDark ? 'dark' : 'light');
      themeToggle.setAttribute('aria-pressed', String(isDark));
    });
  }
  
  // ===== МОБИЛЬНОЕ МЕНЮ =====
  function initMobileMenu() {
    if (!burger || !mobileMenu) return;
    
    const toggleMenu = () => {
      const isExpanded = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!isExpanded));
      mobileMenu.style.display = isExpanded ? 'none' : 'block';
      mobileMenu.setAttribute('aria-hidden', String(isExpanded));
      
      if (!isExpanded) {
        mobileMenu.style.animation = 'slideDown 0.3s ease';
      }
    };
    
    burger.addEventListener('click', toggleMenu);
    
    // Закрытие меню при клике на ссылку
    $$('.mobile__link').forEach(link => {
      link.addEventListener('click', () => {
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.style.display = 'none';
        mobileMenu.setAttribute('aria-hidden', 'true');
      });
    });
  }
  
  // ===== ПЛАВНАЯ ПРОКРУТКА =====
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href === '#top') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        if (href === '#' || !$(href)) return;
        
        e.preventDefault();
        const target = $(href);
        const headerHeight = header?.offsetHeight || 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        
        window.scrollTo({
          top: targetPosition - headerHeight - 20,
          behavior: 'smooth'
        });
      });
    });
  }
  
  // ===== АКТИВНЫЙ ПУНКТ МЕНЮ =====
  function initActiveNav() {
    const sections = $$('main section[id]');
    const navLinks = $$('.nav__link');
    
    if (!sections.length || !navLinks.length) return;
    
    const setActiveLink = () => {
      const scrollPosition = window.scrollY + 150; // Оптимальное смещение
      
      let currentSection = null;
      
      // Находим активную секцию
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          currentSection = section.id;
        }
      });
      
      // Если мы прокрутили до конца страницы
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      if (isAtBottom && !currentSection) {
        currentSection = sections[sections.length - 1].id;
      }
      
      // Если не нашли секцию - берем первую
      if (!currentSection && scrollPosition < sections[0].offsetTop) {
        currentSection = sections[0].id;
      }
      
      // Устанавливаем активный класс
      navLinks.forEach(link => {
        const href = link.getAttribute('href').slice(1);
        link.classList.toggle('is-active', href === currentSection);
      });
    };
    
    window.addEventListener('scroll', setActiveLink);
    setActiveLink(); // Инициализация при загрузке
  }
  
  // ===== МОДАЛЬНОЕ ОКНО ПРАЙСА =====
  function initPriceModal() {
    const modal = $('#modal');
    const modalImg = $('#modalImg');
    
    if (!modal || !modalImg) return;
    
    const PRICE_IMAGES = {
      epilation: 'src/img/epilation.jpg',
      lpg: 'src/img/lpg.jpg'
    };
    
    const openModal = (imgSrc) => {
      modalImg.src = imgSrc;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    
    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      modalImg.src = '';
      document.body.style.overflow = '';
    };
    
    // Кнопки прайса
    $$('[data-price]').forEach(btn => {
      btn.addEventListener('click', () => {
        const priceKey = btn.getAttribute('data-price');
        const imgSrc = PRICE_IMAGES[priceKey];
        if (imgSrc) openModal(imgSrc);
      });
    });
    
    // Закрытие модального окна
    modal.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-close') || e.target === modal) {
        closeModal();
      }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }
  
  // ===== МОДАЛЬНОЕ ОКНО ЗАПИСИ =====
  function initBookingModal() {
    const bookingModal = $('#bookingModal');
    const openButtons = $$('[data-booking-open]');
    const form = $('#bookingFormModal');
    const hint = $('#formHintModal');
    
    if (!bookingModal || !openButtons.length) return;
    
    let lastSubmitTime = 0;
    const SUBMIT_COOLDOWN = 10000; // 10 секунд
    
    const openModal = () => {
      bookingModal.classList.add('is-open');
      bookingModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      
      // Фокус на первом поле
      const firstInput = bookingModal.querySelector('input, select, textarea');
      firstInput?.focus();
    };
    
    const closeModal = () => {
      bookingModal.classList.remove('is-open');
      bookingModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (hint) hint.textContent = '';
    };
    
    // Открытие модального окна
    openButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });
    
    // Закрытие модального окна
    bookingModal.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-booking-close') || e.target === bookingModal) {
        closeModal();
      }
    });
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bookingModal.classList.contains('is-open')) {
        closeModal();
      }
    });
    
    // Обработка отправки формы
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Проверка кулдауна
      const now = Date.now();
      if (now - lastSubmitTime < SUBMIT_COOLDOWN) {
        if (hint) {
          hint.textContent = '⚠️ Подождите 10 секунд перед повторной отправкой';
          hint.style.color = '#ff6b6b';
        }
        return;
      }
      lastSubmitTime = now;
      
      // Получение данных формы
      const formData = {
        name: form.querySelector('[name="name"]').value.trim(),
        phone: form.querySelector('[name="phone"]').value.trim(),
        date: form.querySelector('[name="date"]').value.trim(),
        service: form.querySelector('[name="service"]').value,
        time: form.querySelector('[name="time"]').value,
        comment: form.querySelector('[name="comment"]').value.trim(),
        timestamp: new Date().toISOString()
      };
      
      // Валидация
      if (!formData.name || !formData.phone || !formData.date || !formData.service || !formData.time) {
        if (hint) {
          hint.textContent = '⚠️ Пожалуйста, заполните все обязательные поля';
          hint.style.color = '#ff6b6b';
        }
        return;
      }
      
      // Валидация телефона
      const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;
      if (!phoneRegex.test(formData.phone)) {
        if (hint) {
          hint.textContent = '⚠️ Введите корректный номер телефона';
          hint.style.color = '#ff6b6b';
        }
        return;
      }
      
      // Валидация даты
      const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
      if (!dateRegex.test(formData.date)) {
        if (hint) {
          hint.textContent = '⚠️ Введите дату в формате ДД.ММ.ГГГГ';
          hint.style.color = '#ff6b6b';
        }
        return;
      }
      
      // Анимация отправки
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.classList.add('sending');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';
      
      if (hint) {
        hint.textContent = 'Отправляем заявку...';
        hint.style.color = 'var(--tiffany)';
      }
      
      try {
        // Имитация отправки на сервер
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Успешная отправка
        if (hint) {
          hint.textContent = '✅ Заявка отправлена! Мы свяжемся с вами в течение 15 минут.';
          hint.style.color = '';
        }
        
        // Очистка формы
        form.reset();
        
        // Показ сообщения об успехе и закрытие модального окна
        setTimeout(() => {
          closeModal();
          showThankYouMessage(formData.name);
        }, 2000);
        
      } catch (error) {
        console.error('Ошибка отправки формы:', error);
        
        if (hint) {
          hint.textContent = '⚠️ Ошибка отправки. Пожалуйста, позвоните нам: +7 (978) 742-08-04';
          hint.style.color = '#ff6b6b';
        }
        
      } finally {
        // Восстановление кнопки
        submitBtn.classList.remove('sending');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
  
  // ===== СООБЩЕНИЕ ОБ УСПЕХЕ =====
  window.showThankYouMessage = function(name) {
    const thankYou = document.createElement('div');
    thankYou.innerHTML = `
      <div class="thank-you-message" style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-card);
        padding: 40px;
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        border: 1px solid var(--tiffany);
        text-align: center;
        z-index: 1000;
        max-width: 400px;
        width: 90%;
        animation: slideDown 0.3s ease;
      ">
        <h3 style="margin-top: 0; color: var(--tiffany); font-size: 22px; margin-bottom: 16px;">
          Спасибо, ${name}!
        </h3>
        <p style="color: var(--text-muted); line-height: 1.6; margin-bottom: 24px;">
          Мы получили вашу заявку и скоро перезвоним для подтверждения.
        </p>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: var(--tiffany);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          font-size: 15px;
        ">
          Закрыть
        </button>
      </div>
    `;
    document.body.appendChild(thankYou);
  };
  
  // ===== КНОПКА "НАВЕРХ" =====
  function initToTopButton() {
    if (!toTop) return;
    
    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        toTop.classList.add('is-show');
      } else {
        toTop.classList.remove('is-show');
      }
    };
    
    window.addEventListener('scroll', toggleVisibility);
    toggleVisibility(); // Инициализация
    
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  // ===== ПАРАЛЛАКС ФОНА =====
  function initParallax() {
    const bgAnimated = $('.bg-animated');
    if (!bgAnimated) return;
    
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      bgAnimated.style.transform = `translate3d(0, ${rate}px, 0)`;
    });
  }
  
  // ===== АНИМАЦИЯ ПОЯВЛЕНИЯ ЭЛЕМЕНТОВ =====
  function initRevealAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);
    
    // Наблюдение за элементами
    $$('.card, .h2, .lead').forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }
  
  // ===== МАСКИ ДЛЯ ФОРМ =====
  function initFormMasks() {
    // Маска для телефона
    const phoneInput = $('input[name="phone"]');
    if (phoneInput) {
      phoneInput.addEventListener('input', function(e) {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length > 0) {
          if (!value.startsWith('7')) {
            value = '7' + value;
          }
          
          let formatted = '+7';
          
          if (value.length > 1) {
            formatted += ' (' + value.substring(1, 4);
          }
          if (value.length >= 4) {
            formatted += ') ' + value.substring(4, 7);
          }
          if (value.length >= 7) {
            formatted += '-' + value.substring(7, 9);
          }
          if (value.length >= 9) {
            formatted += '-' + value.substring(9, 11);
          }
          
          this.value = formatted.substring(0, 18);
        }
      });
    }
    
    // Маска для даты
    const dateInput = $('input[name="date"]');
    if (dateInput) {
      dateInput.addEventListener('input', function(e) {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
          value = value.substring(0, 2) + '.' + value.substring(2);
        }
        if (value.length >= 5) {
          value = value.substring(0, 5) + '.' + value.substring(5);
        }
        
        this.value = value.substring(0, 10);
      });
    }
  }
  
  // ===== ОБРАБОТЧИКИ СКОРОСТИ АНИМАЦИЙ =====
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-speed', '0.001s');
  }
})();

// Пример кода для получения отзывов (добавь в script.js)
async function loadYandexReviews() {
  const widget = document.createElement('div');
  widget.className = 'yandex-reviews-widget';
  widget.innerHTML = `
    <iframe 
      src="https://yandex.ru/maps/org/siluet/72860898382/?ll=33.552912%2C44.593270&z=17" 
      class="yandex-reviews-frame"
      title="Отзывы о Siluet на Яндекс Картах">
    </iframe>
  `;
  
  const reviewsSection = document.querySelector('#reviews .container');
  const existingGrid = reviewsSection.querySelector('.reviews-grid');
  
  if (existingGrid) {
    reviewsSection.insertBefore(widget, existingGrid.nextSibling);
  }
}