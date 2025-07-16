// ========== Баланс и Отклики ==========
let balance = parseInt(localStorage.getItem('balance') || "1000"); // старт баланс для теста
updateBalanceDisplay();

function respondToRequest(price, contactInfo) {
  if (confirm(`С вашего баланса будет списано ${price} ₸. Открыть контакты?`)) {
    if (balance >= price) {
      balance -= price;
      localStorage.setItem('balance', balance);
      alert(`Контакт клиента: ${contactInfo}\nЕсли клиент не ответил, нажмите 'Не дозвонился' для возврата.`);
      updateBalanceDisplay();
    } else {
      alert("Недостаточно средств. Пополните баланс.");
    }
  }
}

function notAnswered(price) {
  alert("Возврат средств за недозвон.");
  balance += price;
  localStorage.setItem('balance', balance);
  updateBalanceDisplay();
}

function updateBalanceDisplay() {
  document.querySelectorAll('#balance').forEach(el => {
    el.textContent = `Ваш баланс: ${balance} ₸`;
  });
}

// ========== Фильтрация заявок или мастеров ==========
const searchInput = document.getElementById('search');
if (searchInput) searchInput.addEventListener('input', filterRequests);

function filterRequests() {
  const query = (searchInput ? searchInput.value.toLowerCase() : "");
  let items = Array.from(document.querySelectorAll('.item')); // .item = заявка или мастер

  items.forEach(el => {
    const text = el.textContent.toLowerCase();
    el.style.display = (!query || text.includes(query)) ? "block" : "none";
  });
}

// ========== Голосовой поиск ==========
function startVoiceSearch() {
  const recognition = new(window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "ru-RU";
  recognition.start();
  recognition.onresult = function(event) {
    if (searchInput) {
      searchInput.value = event.results[0][0].transcript;
      filterRequests();
      showAutocomplete({ target: searchInput });
    }
  }
}

// ========== Тема ==========
function toggleTheme() {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
}
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light');
}

// ========== Автокомплит по услугам ==========
const allServices = ["Электрика", "Сантехника", "Сварка", "Отделка"];
const autocompleteBox = document.createElement('div');
autocompleteBox.className = 'autocomplete-box';
document.body.appendChild(autocompleteBox);

if (searchInput) {
  searchInput.addEventListener('input', showAutocomplete);
  document.addEventListener('click', () => autocompleteBox.style.display = 'none');
}

function showAutocomplete(e) {
  const query = e.target.value.toLowerCase();
  if (!query) {
    autocompleteBox.style.display = 'none';
    return;
  }

  const matches = allServices.filter(item =>
    item.toLowerCase().includes(query)
  );

  autocompleteBox.innerHTML = '';
  matches.forEach(item => {
    const div = document.createElement('div');
    div.className = 'autocomplete-item';
    div.textContent = item;
    div.onclick = () => {
      searchInput.value = item;
      filterRequests();
      autocompleteBox.style.display = 'none';
    };
    autocompleteBox.appendChild(div);
  });

  if (matches.length > 0) {
    const rect = searchInput.getBoundingClientRect();
    autocompleteBox.style.left = rect.left + 'px';
    autocompleteBox.style.top = (rect.bottom + window.scrollY) + 'px';
    autocompleteBox.style.width = rect.width + 'px';
    autocompleteBox.style.display = 'block';
  } else {
    autocompleteBox.style.display = 'none';
  }
}

// ========== Лента истории посещений ==========
document.addEventListener("DOMContentLoaded", () => {
  const pageHistory = JSON.parse(localStorage.getItem('pageHistory') || "[]");
  const currentPage = window.location.pathname.split("/").pop();

  if (!pageHistory.includes(currentPage)) {
    pageHistory.push(currentPage);
    localStorage.setItem('pageHistory', JSON.stringify(pageHistory));
  }

  if (pageHistory.length > 1) {
    const pageNames = {
      "index.html": "Главная",
      "zayavki.html": "Заявки",
      "about.html": "О сервисе",
      "contacts.html": "Контакты",
      "masters.html": "Каталог мастеров",
      "master.html": "Кабинет мастера",
      "forma.html": "Заявка",
      "offline.html": "Оффлайн"
    };

    const toggleLink = document.createElement('div');
    toggleLink.textContent = "➔";
    toggleLink.style.position = "fixed";
    toggleLink.style.bottom = "70px";
    toggleLink.style.left = "20px";
    toggleLink.style.zIndex = "1001";
    toggleLink.style.fontSize = "20px";
    toggleLink.style.color = "#ccc";
    toggleLink.style.cursor = "pointer";
    toggleLink.style.fontFamily = "Verdana, sans-serif";
    document.body.appendChild(toggleLink);

    const historyBox = document.createElement('div');
    historyBox.style.display = "none";
    historyBox.style.position = "fixed";
    historyBox.style.bottom = "0";
    historyBox.style.left = "0";
    historyBox.style.right = "0";
    historyBox.style.background = "#000";
    historyBox.style.borderTop = "2px solid #fff";
    historyBox.style.padding = "14px 20px";
    historyBox.style.zIndex = "1000";
    historyBox.style.overflowX = "auto";
    historyBox.style.whiteSpace = "nowrap";
    historyBox.style.color = "#fff";
    historyBox.style.fontFamily = "Verdana, sans-serif";
    historyBox.style.fontSize = "20px";
    historyBox.style.boxShadow = "0 0 15px rgba(255,255,255,0.2)";
    historyBox.style.transform = "perspective(600px) rotateX(2deg)";
    historyBox.style.scrollbarWidth = "thin";

    const notification = document.createElement('span');
    notification.innerHTML = "🗂 <strong>Вы были здесь:</strong> ";
    notification.style.marginRight = "15px";
    historyBox.appendChild(notification);

    pageHistory.forEach(page => {
      const link = document.createElement('a');
      link.href = page;
      link.textContent = pageNames[page] || page.replace('.html', '').replace('-', ' ').toUpperCase();
      link.style.margin = "0 12px";
      link.style.display = "inline-block";
      link.style.color = "#fff";
      link.style.transition = "all 0.3s ease";
      link.style.textShadow = "0 0 5px #aaa";
      link.onmouseover = () => {
        link.style.transform = "scale(1.2)";
        link.style.textShadow = "0 0 15px #fff";
      };
      link.onmouseout = () => {
        link.style.transform = "scale(1)";
        link.style.textShadow = "0 0 5px #aaa";
      };
      historyBox.appendChild(link);
    });

    document.body.appendChild(historyBox);

    toggleLink.onclick = () => {
      if (historyBox.style.display === "none") {
        historyBox.style.display = "block";
        toggleLink.textContent = "⬅";
      } else {
        historyBox.style.display = "none";
        toggleLink.textContent = "➔";
      }
    };
  }
});
