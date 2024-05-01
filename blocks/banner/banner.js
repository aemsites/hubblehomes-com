export default function decorate(block) {
  const text = block.querySelector('div:nth-child(2)');
  text.classList.add('spotlightcircle');

  const formHtml = `<div class="input-group">
    <div class="form-group"><input type="text" name="email" class="form-control input-sm" required="" placeholder="Enter Email"></div>
     <span class="input-group-btn"><button type="submit" class="btn btn-primary btn-sm" aria-label="Submit">SUBMIT</button></span>
  </div>`;
  const form = document.createElement('div');
  form.innerHTML = formHtml;

  text.append(form);
}