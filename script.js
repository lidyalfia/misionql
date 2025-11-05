const SUPABASE_URL = "https://ssodjtmjwlvbprlecrrj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzb2RqdG1qd2x2YnBybGVjcnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzg5MDAsImV4cCI6MjA3MTc1NDkwMH0.N8brL_NYDbBs_WDxTOryXp91rQ2eUN3Snh8mcqTRda4";
const { createClient } = supabase;
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentLevel = 0;
let playerName = "";
let totalErrors = 0; // To accumulate errors across all levels
let levelCompleted = false; // Track if current level is completed
let completedLevels = new Set(); // Track completed levels
let isScorePopupActive = false; // Flag to track popup status

async function submitName() {
  playerName = document.getElementById("playerName").value.trim();
  if (!playerName) {
    alert("Silakan masukkan nama terlebih dahulu!");
    return;
  }

  // Simpan nama ke tabel missionql
  const { data, error } = await client
    .from("missionql")
    .insert([{ nama: playerName, skor: 0 }]);

  if (error) {
    console.error(
      "Gagal simpan ke Supabase:",
      error.message,
      error.details,
      error.code
    );
    alert(`Terjadi kesalahan saat menyimpan nama: ${error.message}`);
    return;
  }

  console.log("Data tersimpan:", data);

  // Hide name form and show game container
  document.getElementById("nameForm").style.display = "none";
  document.getElementById("gameContainer").style.display = "block";

  // Initialize the game
  currentLevel = 0;
  loadLevel(currentLevel);
  updateButtons();
  try {
    createGrid();
    initDraggables();
    document.getElementById("description").innerHTML =
      levels[currentLevel].description;
    document.getElementById("data-table-container").innerHTML =
      levels[currentLevel].tableData || "";
  } catch (err) {
    console.error("Error initializing game:", err);
    alert("Terjadi kesalahan saat memulai game. Silakan coba lagi.");
  }
}

function nextLevel() {
  if (currentLevel < levels.length - 1 && levelCompleted) {
    currentLevel++;
    levelCompleted = false; // Reset for new level
    loadLevel(currentLevel);
  } else if (!levelCompleted && currentLevel < levels.length - 1) {
    alert("Selesaikan level ini dan klik 'Cek Jawaban' terlebih dahulu!");
  } else if (currentLevel === levels.length - 1 && levelCompleted) {
    showScorePopup();
  }
  updateButtons();
}

function updateButtons() {
  document.getElementById("nextButton").disabled =
    currentLevel === levels.length - 1 && !levelCompleted;
}

function loadLevel(level) {
  if (!isScorePopupActive) {
    // Only load level if popup is not active
    const levelData = levels[level];
    document.getElementById("description").innerHTML = levelData.description;
    document.getElementById("data-table-container").innerHTML =
      levelData.tableData || "";
    resetGame();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const collapses = document.querySelectorAll(".collapse");

  collapses.forEach((collapse) => {
    collapse.addEventListener("show.bs.collapse", function () {
      const targetBtn = document.querySelector(
        `[data-bs-target="#${this.id}"]`
      );
      if (targetBtn) {
        targetBtn.classList.add("active-item");
      }
    });

    collapse.addEventListener("hide.bs.collapse", function () {
      const targetBtn = document.querySelector(
        `[data-bs-target="#${this.id}"]`
      );
      if (targetBtn) {
        targetBtn.classList.remove("active-item");
      }
    });
  });
});

// Game Functionality
const levels = [
  {
    description:
      "Saya ingin membuat tabel yang bernama <b>siswa</b>. Dalam tabel siswa, ada 4 kolom yaitu <b>id</b> dengan tipe data integer dan unik (primary key), <b>nama</b> dengan tipe data varchar dengan panjang variabel 100, <b>umur</b> dengan tipe data integer, dan <b>kelas</b> dengan tipe data varchar dengan panjang variabel 100.",
    layout: [
      ["CREATE", "TABLE", "siswa", "(", ""],
      ["", "id", "INT", "PRIMARY", "KEY"],
      ["", "nama", "VARCHAR", "(100),", ""],
      ["", "umur", "INT,", "", ""],
      ["", "Kelas", "VARCHAR", "(100)", ");"],
    ],
    disabledCells: [],
    mergedCells: [],
    tableData: null,
  },
  {
    description:
      "Saya ingin membuat perintah <b>INSERT INTO</b> pada tabel <b>siswa</b>. Tabel tersebut memiliki kolom <b>id, nama, umur, kelas</b>. Lihat tabel di bawah ini lalu susunlah membentuk query yang benar",
    layout: [
      ["INSERT", "INTO", "siswa", "(id,", "nama,", "umur,", "kelas)", "VALUES"],
      ["", "", "", "(1,", "'Adi',", "17,", "'XI RA'),", ""],
      ["", "", "", "(2,", "'Budi',", "18,", "'XI RB'),", ""],
      ["", "", "", "(3,", "'Cinta',", "16,", "'XI RC'),", ""],
      ["", "", "", "(4,", "'Denis',", "17,", "'XI RD'),", ";"],
    ],
    disabledCells: [],
    mergedCells: [],
    tableData: `
      <table class="data-table">
        <thead>
          <tr>
            <th>id</th>
            <th>nama</th>
            <th>umur</th>
            <th>kelas</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Adi</td>
            <td>17</td>
            <td>XI RA</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Budi</td>
            <td>18</td>
            <td>XI RB</td>
          </tr>
          <tr>
            <td>3</td>
            <td>Cinta</td>
            <td>16</td>
            <td>XI RC</td>
          </tr>
          <tr>
            <td>4</td>
            <td>Denis</td>
            <td>17</td>
            <td>XI RD</td>
          </tr>
        </tbody>
      </table>
    `,
  },
  {
    description:
      "Saya ingin membuat perintah untuk mengetahui <b>rata-rata umur</b> pada tabel <b>siswa</b>. Beri nama baru pada kolom hasil perhitungan rata-rata umur siswa tersebut sebagai <b>rata-rata</b>.",
    layout: [
      ["SELECT", "AVG", "(umur)", "AS", "rata_rata"],
      ["FROM", "siswa", ";", "", ""],
    ],
    disabledCells: [
      [1, 3],
      [1, 4],
    ],
    mergedCells: [],
    tableData: null,
  },
  {
    description:
      "Saya ingin mengetahui <b>siswa yang memiliki umur paling tinggi</b> pada tabel <b>siswa</b>.",
    layout: [
      ["SELECT", "*", "", "", "", "", "", "", ""],
      ["FROM", "siswa", "", "", "", "", "", "", ""],
      ["WHERE", "umur", "=", "(SELECT", "MAX", "(umur)", "FROM", "siswa)", ";"],
    ],
    disabledCells: [
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [0, 7],
      [0, 8],
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [1, 6],
      [1, 7],
      [1, 8],
    ],
    mergedCells: [],
    tableData: null,
  },
  {
    description:
      "Saya ingin membuat perintah untuk menampilkan data dari tabel siswa <b>yang bukan umur 17</b>.",
    layout: [
      ["SELECT", "*", "FROM", "siswa", "", ""],
      ["WHERE", "NOT", "umur", "=", "'17'", ";"],
    ],
    disabledCells: [
      [0, 4],
      [0, 5],
    ],
    mergedCells: [],
    tableData: null,
  },
];

let answer = [];
let touchItem = null;
let isDragging = false;

const grid = document.getElementById("grid");
const draggables = document.getElementById("draggables");
const description = document.getElementById("description");
const dataTableContainer = document.getElementById("data-table-container");
const scoreDisplay = document.getElementById("score");
const nameForm = document.getElementById("nameForm");
const gameContainer = document.getElementById("gameContainer");

function createGrid() {
  const level = levels[currentLevel];
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${level.layout[0].length}, 100px)`;
  level.layout.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const div = document.createElement("div");
      div.classList.add("cell");

      const isDisabled = level.disabledCells.some(
        ([r, c]) => r === rowIndex && c === colIndex
      );
      if (cell !== "" && !isDisabled && !completedLevels.has(currentLevel)) {
        div.classList.add("enabled");

        // Drag-and-drop event listeners
        div.ondragover = (e) => {
          e.preventDefault();
          if (!div.textContent) div.classList.add("drag-over");
        };
        div.ondragleave = () => div.classList.remove("drag-over");
        div.ondrop = (e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData("text/plain");
          const dragged = document.getElementById(id);
          if (!div.textContent && dragged) {
            div.textContent = dragged.textContent;
            div.classList.remove("drag-over");
            dragged.remove();
          }
        };

        // Click to remove word back to draggables
        div.addEventListener("click", () => {
          if (div.textContent && !completedLevels.has(currentLevel)) {
            const word = div.textContent;
            div.textContent = "";
            createDraggable(word);
          }
        });

        // Touch events for drag-and-drop
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;

        div.addEventListener("touchstart", (e) => {
          e.preventDefault();
          touchStartTime = Date.now();
          const touch = e.touches[0];
          touchStartX = touch.clientX;
          touchStartY = touch.clientY;
          if (!div.textContent && touchItem) {
            div.classList.add("drag-over");
          }
        });

        div.addEventListener("touchmove", (e) => {
          const touch = e.touches[0];
          const deltaX = Math.abs(touch.clientX - touchStartX);
          const deltaY = Math.abs(touch.clientY - touchStartY);
          if (deltaX > 10 || deltaY > 10) {
            isDragging = true;
          }
        });

        div.addEventListener("touchend", (e) => {
          e.preventDefault();
          div.classList.remove("drag-over");
          const touchDuration = Date.now() - touchStartTime;
          if (!isDragging && touchDuration < 300 && div.textContent) {
            const word = div.textContent;
            div.textContent = "";
            createDraggable(word);
          }
          isDragging = false;
        });
      } else {
        div.classList.add("disabled");
        div.textContent = cell; // Tampilkan teks untuk disabled cells
      }

      level.mergedCells.forEach((merge) => {
        if (rowIndex === merge.row && colIndex === merge.col) {
          div.classList.add("merged");
        }
      });

      grid.appendChild(div);
    });
  });
}

function createDraggable(word, id) {
  const span = document.createElement("span");
  span.className = "draggable";
  span.textContent = word;
  span.id = id || `word-${Math.random().toString(36).substr(2, 9)}`;

  // Drag-and-drop functionality
  span.draggable = !completedLevels.has(currentLevel);
  span.ondragstart = (e) => {
    if (!completedLevels.has(currentLevel)) {
      e.dataTransfer.setData("text/plain", span.id);
    }
  };

  // Touch events for drag-and-drop
  let startX = 0,
    startY = 0;
  let offsetX = 0,
    offsetY = 0;
  let touchStartTime = 0;

  span.addEventListener("touchstart", (e) => {
    if (completedLevels.has(currentLevel)) return;
    e.preventDefault();
    touchItem = span;
    isDragging = false;
    touchStartTime = Date.now();
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    const rect = span.getBoundingClientRect();
    offsetX = startX - rect.left;
    offsetY = startY - rect.top;
    span.style.position = "fixed";
    span.style.left = `${rect.left}px`;
    span.style.top = `${rect.top}px`;
    span.style.zIndex = "1000";
  });

  span.addEventListener("touchmove", (e) => {
    if (completedLevels.has(currentLevel)) return;
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);
    if (deltaX > 10 || deltaY > 10) {
      isDragging = true;
    }
    const newX = touch.clientX - offsetX;
    const newY = touch.clientY - offsetY;
    span.style.left = `${newX}px`;
    span.style.top = `${newY}px`;
  });

  span.addEventListener("touchend", (e) => {
    if (completedLevels.has(currentLevel)) return;
    e.preventDefault();
    span.style.visibility = "hidden";
    const touch = e.changedTouches[0];
    const touchDuration = Date.now() - touchStartTime;
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    span.style.visibility = "visible";

    // Deteksi tap (sentuhan singkat)
    if (touchDuration < 300 && !isDragging) {
      placeWordAutomatically(word, span); // Panggil fungsi untuk tap
    } else if (
      isDragging &&
      target &&
      target.classList.contains("cell") &&
      target.classList.contains("enabled") &&
      !target.textContent
    ) {
      // Logika drag-and-drop
      target.textContent = span.textContent;
      target.classList.remove("drag-over");
      span.remove();
      touchItem = null;
    } else {
      // Kembalikan posisi span jika tidak ditempatkan
      span.style.position = "relative";
      span.style.left = "auto";
      span.style.top = "auto";
      span.style.zIndex = "1";
      touchItem = null;
    }
    isDragging = false;
  });

  // Click to place automatically (untuk desktop)
  span.addEventListener("click", () => {
    if (completedLevels.has(currentLevel)) return;
    placeWordAutomatically(word, span);
  });

  draggables.appendChild(span);
}

function placeWordAutomatically(word, span) {
  const cells = document.querySelectorAll(".cell.enabled");
  let placed = false;

  // Cari sel kosong secara berurutan dari kiri atas
  for (let cell of cells) {
    if (!cell.textContent) {
      cell.textContent = word;
      span.remove();
      placed = true;
      break;
    }
  }

  if (!placed) {
    alert("Tidak ada sel kosong yang tersedia!");
  }
}

function initDraggables() {
  draggables.innerHTML = "";
  answer = levels[currentLevel].layout.flat().filter((cell) => cell !== "");
  answer
    .sort(() => 0.5 - Math.random())
    .forEach((word) => createDraggable(word));
}

function initDraggables() {
  draggables.innerHTML = "";
  answer = levels[currentLevel].layout.flat().filter((cell) => cell !== "");
  answer
    .sort(() => 0.5 - Math.random())
    .forEach((word) => createDraggable(word));
}

async function checkAnswer() {
  const cells = [...document.querySelectorAll(".cell")];
  const flatLayout = levels[currentLevel].layout.flat();
  let salah = 0;

  // Check if all cells are filled
  const emptyCells = cells.filter(
    (cell) =>
      !cell.classList.contains("disabled") &&
      !cell.textContent.trim() &&
      !levels[currentLevel].disabledCells.some(
        ([r, c]) =>
          r === Math.floor(cells.indexOf(cell) / flatLayout.length) &&
          c === cells.indexOf(cell) % flatLayout.length
      )
  );
  if (emptyCells.length > 0) {
    alert("Susun semua puzzle hingga benar-benar rampung!");
    return;
  }

  cells.forEach((cell, index) => {
    const expected = flatLayout[index];
    const isDisabled = expected === "" || cell.classList.contains("disabled");
    const val = cell.textContent.trim();

    if (!isDisabled) {
      if (val !== expected) salah++;
    }
  });

  totalErrors += salah;
  levelCompleted = true;
  completedLevels.add(currentLevel);

  // Create correct answer display
  const correctAnswerDiv = document.createElement("div");
  correctAnswerDiv.style.marginTop = "20px";
  correctAnswerDiv.style.color = "#00bcd4";
  correctAnswerDiv.style.fontWeight = "bold";
  correctAnswerDiv.textContent = `Jawaban Benar: ${flatLayout
    .filter((cell) => cell !== "")
    .join(" ")}`;

  // Clear previous correct answer display
  const existingCorrectAnswer = document.getElementById("correctAnswer");
  if (existingCorrectAnswer) {
    existingCorrectAnswer.remove();
  }

  if (salah === 0) {
    alert("✅ Jawaban Benar!");
  } else {
    alert(`❌ Jawaban Salah (${salah} kesalahan).`);
    correctAnswerDiv.id = "correctAnswer";
    grid.insertAdjacentElement("afterend", correctAnswerDiv);
  }

  updateButtons();
}

function resetGame() {
  createGrid();
  initDraggables();
  scoreDisplay.textContent = "";
  const existingCorrectAnswer = document.getElementById("correctAnswer");
  if (existingCorrectAnswer) {
    existingCorrectAnswer.remove();
  }
}

async function showScorePopup() {
  // Set flag popup aktif
  isScorePopupActive = true;

  // Forcefully hide entire game section
  const gameSection = document.getElementById("game-section");
  const desc = document.getElementById("description");
  desc.style.display = "none !important"; // Override CSS
  desc.style.visibility = "hidden"; // Prevent rendering
  desc.style.position = "absolute"; // Remove from layout

  gameSection.style.display = "none !important";
  gameSection.style.visibility = "hidden";
  gameSection.style.position = "absolute";
  gameSection.style.left = "-9999px"; // Move off-screen
  gameSection.style.opacity = "0"; // Additional visual hide
  gameSection.setAttribute("aria-hidden", "true"); // Accessibility hide
  gameSection.removeAttribute("style");
  gameSection.style.display = "none !important";

  // Create popup container
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.backgroundColor = "#4a4a4a";
  popup.style.color = "#00bcd4";
  popup.style.padding = "20px";
  popup.style.borderRadius = "10px";
  popup.style.textAlign = "center";
  popup.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  popup.style.width = "300px";
  popup.style.zIndex = "1000";

  // Add title
  const title = document.createElement("h2");
  title.textContent = "Selamat! Skor Anda";
  title.style.margin = "0 0 10px";
  popup.appendChild(title);

  // Add score display
  const scoreBox = document.createElement("div");
  scoreBox.style.backgroundColor = "#666";
  scoreBox.style.padding = "15px";
  scoreBox.style.borderRadius = "5px";
  scoreBox.style.marginBottom = "20px";
  scoreBox.style.border = "1px solid #00bcd4";
  const scoreText = document.createElement("span");
  scoreText.textContent = "";
  scoreText.style.fontSize = "24px";
  scoreText.style.fontWeight = "bold";
  scoreBox.appendChild(scoreText);
  popup.appendChild(scoreBox);

  // Add "Main Lagi" button
  const playAgainBtn = document.createElement("button");
  playAgainBtn.textContent = "Main Lagi";
  playAgainBtn.style.padding = "10px 20px";
  playAgainBtn.style.fontSize = "16px";
  playAgainBtn.style.fontWeight = "bold";
  playAgainBtn.style.backgroundColor = "#00bcd4";
  playAgainBtn.style.color = "white";
  playAgainBtn.style.border = "none";
  playAgainBtn.style.borderRadius = "5px";
  playAgainBtn.style.cursor = "pointer";
  playAgainBtn.onclick = () => {
    // Reset game state
    currentLevel = 0;
    totalErrors = 0;
    levelCompleted = false;
    completedLevels.clear();
    location.reload();
    // Hide popup and overlay
    const popup = document.querySelector(".popup");
    const overlay = document.querySelector(".overlay");
    if (popup) document.body.removeChild(popup);
    if (overlay) document.body.removeChild(overlay);

    // Restore game section and reset states
    gameSection.style.display = "block";
    gameSection.style.visibility = "visible";
    gameSection.style.position = "relative";
    gameSection.style.left = "0";
    gameSection.style.opacity = "1";
    gameSection.removeAttribute("aria-hidden");
    document.getElementById("nameForm").style.display = "flex";
    document.getElementById("gameContainer").style.display = "none";

    // Clear input and score
    document.getElementById("playerName").value = "";
    document.getElementById("score").textContent = "";
    window.scrollTo(0, gameSection.offsetTop);

    // Reset flag popup
    isScorePopupActive = false;
  };
  popup.appendChild(playAgainBtn);

  // Add popup to body
  document.body.appendChild(popup);

  // Optional: Add overlay
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.zIndex = "999";
  overlay.onclick = () => {
    document.body.removeChild(overlay);
    document.body.removeChild(popup);
  };
  document.body.appendChild(overlay);

  // Calculate and display score when ">" is clicked at the last level
  if (currentLevel === levels.length - 1 && levelCompleted) {
    let skor = 100;
    if (totalErrors >= 1 && totalErrors <= 4) skor = 95;
    else if (totalErrors >= 5 && totalErrors <= 7) skor = 90;
    else if (totalErrors >= 8 && totalErrors <= 10) skor = 85;
    else if (totalErrors >= 11 && totalErrors <= 14) skor = 80;
    else if (totalErrors >= 15 && totalErrors <= 18) skor = 75;
    else if (totalErrors >= 19 && totalErrors <= 23) skor = 70;
    else if (totalErrors >= 24 && totalErrors <= 28) skor = 65;
    else if (totalErrors >= 29 && totalErrors <= 35) skor = 60;
    else if (totalErrors >= 36 && totalErrors <= 40) skor = 55;
    else if (totalErrors >= 41 && totalErrors <= 45) skor = 50;
    else if (totalErrors >= 46 && totalErrors <= 50) skor = 45;
    else if (totalErrors > 50) skor = 30;

    const { data, error } = await client
      .from("missionql")
      .update({ skor: skor })
      .eq("nama", playerName);

    if (error) {
      console.error("Gagal update skor:", error);
      alert("Terjadi kesalahan saat menyimpan skor.");
    } else {
      console.log("Skor tersimpan:", skor);
    }

    scoreText.textContent = skor;
  }
}

function restartGame() {
  // Reset game state
  currentLevel = 0;
  totalErrors = 0;
  levelCompleted = false;
  completedLevels.clear();

  const popup = document.querySelector(".popup");
  const overlay = document.querySelector(".overlay");
  if (popup) document.body.removeChild(popup);
  if (overlay) document.body.removeChild(overlay);

  nameForm.style.display = "flex";
  gameContainer.style.display = "none";

  // Clear input and score
  document.getElementById("playerName").value = "";
  scoreDisplay.textContent = "";
}
