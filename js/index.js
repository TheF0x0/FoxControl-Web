/**
 * @author TheF0x0
 * @since 06/04/2023
 */

setInterval(update_page, 250)

const btn_power_on = document.getElementById('btn-power-on')
const btn_power_off = document.getElementById('btn-power-off')
const speed_slider = document.getElementById('speed')

const get_address = () => document.getElementById('address').value
const get_password = () => document.getElementById('password').value
const get_speed = () => speed_slider.value
const make_address = (endpoint) => `https://${get_address()}/${endpoint}`

let power_state = false
let previous_power_state = false

async function make_request(method, endpoint, data) {
    return fetch(make_address(endpoint), {
        method: method,
        ...data
    }).then(res => res.json())
}

btn_power_on.onclick = () => {
    btn_power_on.disabled = true

    make_request('POST', 'enqueue', {
        body: JSON.stringify({
            password: get_password(),
            tasks: [
                {
                    type: 0,
                    is_on: true
                }
            ]
        })
    }).catch(err => console.log(err))
}

btn_power_off.onclick = () => {
    btn_power_off.disabled = true

    make_request('POST', 'enqueue', {
        body: JSON.stringify({
            password: get_password(),
            tasks: [
                {
                    type: 0,
                    is_on: false
                }
            ]
        })
    }).catch(err => console.log(err))
}

speed_slider.onmouseup = () => {
    speed_slider.disabled = true

    make_request('POST', 'enqueue', {
        body: JSON.stringify({
            password: get_password(),
            tasks: [
                {
                    type: 1,
                    speed: parseInt(get_speed())
                }
            ]
        })
    }).catch(err => console.log(err))
}

function update_page() {
    make_request('GET', 'getstate').then(state => {
        previous_power_state = power_state
        power_state = state['is_on']

        if (previous_power_state !== power_state) {
            speed_slider.value = power_state ? 1 : 0
        }

        btn_power_on.disabled = power_state
        btn_power_off.disabled = !power_state;
        speed_slider.disabled = !power_state;

        document.getElementById('power-state').innerHTML = power_state
            ? '<b class="power-state-active">Device is active</b>'
            : '<b class="power-state-idle">Device is idle</b>'

        document.getElementById('target-speed').innerText = `Target Speed: ${state['target_speed']}`
        document.getElementById('actual-speed').innerText = `Actual Speed: ${state['actual_speed']}`
    }).catch(err => console.error(err))
}