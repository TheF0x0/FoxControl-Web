/**
 * @author TheF0x0
 * @since 06/04/2023
 */

setInterval(update_page, 250)
setInterval(update_status, 10)

const btn_power_on = document.getElementById('btn-power-on')
const btn_power_off = document.getElementById('btn-power-off')
const speed_slider = document.getElementById('speed')
const status_container = document.getElementById('status-message')

const get_address = () => document.getElementById('address').value
const get_password = () => document.getElementById('password').value
const get_speed = () => speed_slider.value
const make_address = (endpoint) => `https://${get_address()}/${endpoint}`

const status_time = 200

let power_state = false
let previous_power_state = false
let status_timer = 0

async function make_request(method, endpoint, data) {
    return fetch(make_address(endpoint), {
        method: method,
        ...data
    }).then(res => res.json())
}

function add_status_message(message) {
    status_container.innerHTML = message
    status_timer = status_time
}

function handle_error(error) {
    console.error(error)
    add_status_message(`
        <br>
        <div class="text-danger">
            <b class="text-danger">Error: </b>${error.message}
        </div>
    `)
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
    }).catch(handle_error)
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
    }).catch(handle_error)
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
    }).catch(handle_error)
}

function update_status() {
    if(status_timer > 0) {
        --status_timer
        return
    }

    status_container.innerHTML = ''
}

function update_page() {
    make_request('GET', 'getstate').then(state => {
        previous_power_state = power_state
        power_state = state['is_on']

        if (previous_power_state !== power_state) {
            speed_slider.value = power_state ? 1 : 0
        }

        btn_power_on.disabled = power_state
        btn_power_off.disabled = !power_state

        document.getElementById('power-state').innerHTML = power_state
            ? '<b class="text-danger">Device is active</b>'
            : '<b class="text-success">Device is idle</b>'

        document.getElementById('target-speed').innerText = `Target Speed: ${state['target_speed']}`
        document.getElementById('actual-speed').innerText = `Actual Speed: ${state['actual_speed']}`
    }).catch(handle_error)
}