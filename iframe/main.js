import 'https://cdn.jsdelivr.net/npm/@pipedrive/app-extensions-sdk@0/dist/index.umd.js';

const formFields = (data) => ({
  '9eb22ecc3f3e9d81a4ae7984c286594eaceaa1e1': `${data.firstName} ${data.lastName}`,
  '79c6f6ab1b4231da0c2508b28f42bf2d2a97a9d0': data.phone,
  'f6ccf1d97536097d36ab331d470d57a6b22fd42b': data.email,
  'd8914d77a52def27c0a6c12758e9016b6a4c50e3': data.jobType,
  '9b90ddde4b6789f555d884a94f7a79ef74a8e34b': data.jobSource,
  '54d96c613260e508ea623eed6adc7d6ea09ab13f': data.jobDescription,
  '9c620897f7d2c07321a064cf3b27413d594600ba': `${data.address}, ${data.city}, ${data.state}, ${data.zipCode}`,
  '6567d2f3e77ac94a0389a749dcc699a655539fe4': data.startDate,
  '5dc22dd9a094296cb9a1a4f1cbc10f696d6c8585': data.startTime,
  'c7292198522adec589a36abffba1aa8fb380980d': data.endTime,
  '0332cc03908272c69197e92954c6052497126f89': data.testSelect,
});

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
      body: JSON.stringify({
        title: `JOB #${Math.round(Math.random() * 1000)}`,
        ...formFields(Object.fromEntries(formData.entries())),
      }),
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

