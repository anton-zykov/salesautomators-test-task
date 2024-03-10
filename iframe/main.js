import 'https://cdn.jsdelivr.net/npm/@pipedrive/app-extensions-sdk@0/dist/index.umd.js';

(async function() {
  const sdk = await new AppExtensionsSDK().initialize({
    size: {
      height: 700,
      width: 700,
    }, 
  });
  const form = document.getElementById('jobForm');

  for (const name of Object.keys(localStorage)) {
    form.querySelector(`[name="${name}"]`).value = localStorage.getItem(name);
  }

  form.querySelector('input[name="startTime"]').addEventListener('change', (event) => {
    form.querySelector('input[name="endTime"]').min = event.target.value;
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const response = await fetch('./create', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    });
    localStorage.clear();
  };

  const handleSave = (event) => {
    const formData = new FormData(form);
    for (const [name, value] of formData.entries()) {
      localStorage.setItem(name, value);
    }

    const button = event.target;
    button.textContent = 'Saved!';
    button.classList.add('form__button_success');
    setTimeout(() => {
      button.textContent = 'Save info';
      button.classList.remove('form__button_success');
    }, 3000);
  };

  form.addEventListener('submit', handleSubmit);
  form.querySelector('.form__button_save').addEventListener('click', handleSave);
})();

