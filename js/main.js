const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const customSelect = document.getElementById("customSelect");
const selectTrigger = document.getElementById("selectTrigger");
const selectMenu = document.getElementById("selectMenu");
const selectedText = document.getElementById("selectedText");
const hiddenInput = document.getElementById("motivo-hidden");
const options = document.querySelectorAll(".custom-option");

if (customSelect && selectTrigger && selectMenu && selectedText && hiddenInput) {
  selectTrigger.addEventListener("click", () => {
    const isOpen = selectMenu.classList.toggle("open");
    selectTrigger.classList.toggle("active", isOpen);
    selectTrigger.setAttribute("aria-expanded", String(isOpen));
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.dataset.value || "";
      selectedText.textContent = value;
      hiddenInput.value = value;

      options.forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");

      selectMenu.classList.remove("open");
      selectTrigger.classList.remove("active");
      selectTrigger.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("click", (event) => {
    if (!customSelect.contains(event.target)) {
      selectMenu.classList.remove("open");
      selectTrigger.classList.remove("active");
      selectTrigger.setAttribute("aria-expanded", "false");
    }
  });
}

const contactForm = document.getElementById("contactForm");
const formError = document.getElementById("formError");

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    const nombre = document.getElementById("nombre");
    const email = document.getElementById("email");
    const mensaje = document.getElementById("mensaje");
    const motivo = document.getElementById("motivo-hidden");

    const nombreVal = nombre ? nombre.value.trim() : "";
    const emailVal = email ? email.value.trim() : "";
    const mensajeVal = mensaje ? mensaje.value.trim() : "";
    const motivoVal = motivo ? motivo.value.trim() : "";

    if (!nombreVal || !emailVal || !mensajeVal || !motivoVal) {
      event.preventDefault();

      if (formError) {
        formError.textContent =
          "Por favor, completa todos los campos antes de enviar el mensaje.";
      } else {
        alert("Por favor, completa todos los campos antes de enviar el mensaje.");
      }
      return;
    }

    if (formError) {
      formError.textContent = "";
    }
  });
}