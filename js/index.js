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
const power_state_container = document.getElementById('power-state')
const target_speed_container = document.getElementById('target-speed')
const actual_speed_container = document.getElementById('actual-speed')
const password_input = document.getElementById('password')

const get_address = () => document.getElementById('address').value
const get_password = () => password_input.value
const get_speed = () => parseInt(speed_slider.value)
const make_address = (endpoint) => `https://${get_address()}/${endpoint}`

const status_time = 200

let power_state = false
let previous_power_state = false
let status_timer = 0
let is_authenticated = false
let is_slider_grabbed = false

function reset_page_state() {
    power_state_container.innerHTML = '<b>Device is n/a</b>'
    target_speed_container.innerText = 'Target Speed: n/a'
    actual_speed_container.innerText = 'Actual Speed: n/a'

    btn_power_on.disabled = true
    btn_power_off.disabled = true
    speed_slider.disabled = true
}

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
    add_status_message(`<br><b class="text-danger">${error.message}</b>`)
}

function enqueue_task(type, data) {
    make_request('POST', 'enqueue', {
        body: JSON.stringify({
            password: get_password(),
            tasks: [
                {
                    type: type,
                    ...data
                }
            ]
        })
    }).catch(handle_error)
}

password_input.onchange = () => {
    make_request('POST', 'authenticate', {
        body: JSON.stringify({
            password: get_password()
        })
    }).then(body => {
        is_authenticated = body['status']

        if(!is_authenticated) {
            add_status_message('<br><b class="text-danger">Invalid password</b>')
        }
    })
}

btn_power_on.onclick = () => {
    btn_power_on.disabled = true
    enqueue_task(0, {is_on: true})
}

btn_power_off.onclick = () => {
    btn_power_off.disabled = true
    enqueue_task(0, {is_on: false})
}

speed_slider.onmousedown = () => is_slider_grabbed = true

speed_slider.onmouseup = () => {
    is_slider_grabbed = false
    speed_slider.dispatchEvent(new Event('onchange'))
}

speed_slider.onchange = () => {
    enqueue_task(1, {speed: get_speed()})
    speed_slider.disabled = true
}

function update_status() {
    if (status_timer > 0) {
        --status_timer
        return
    }

    status_container.innerHTML = ''
}

function update_page() {
    if(!is_authenticated) {
        reset_page_state()
        return
    }

    make_request('POST', 'getstate', {
        body: JSON.stringify({
            password: get_password()
        })
    }).then(state => {
        const is_online = state['is_online']
        const accepts_commands = state['accepts_commands']
        const can_control = is_online && accepts_commands
        const target_speed = state['target_speed']
        const actual_speed = state['actual_speed']

        previous_power_state = power_state
        power_state = state['is_on']

        if(!is_slider_grabbed && speed_slider.value !== actual_speed) {
            speed_slider.value = actual_speed
        }

        btn_power_on.disabled = !can_control || power_state
        btn_power_off.disabled = !can_control || !power_state
        speed_slider.disabled = !can_control

        if (!is_online) {
            power_state_container.innerHTML = '<b class="text-danger">Device is offline</b>'
        } else if (!accepts_commands) {
            power_state_container.innerHTML = '<b class="text-warning">Device is busy</b>'
        } else {
            power_state_container.innerHTML = power_state
                ? '<b class="text-success">Device is active</b>'
                : '<b class="text-success">Device is inactive</b>'
        }

        target_speed_container.innerText = `Target Speed: ${target_speed}`
        actual_speed_container.innerText = `Actual Speed: ${actual_speed}`
    }).catch(err => {
        reset_page_state()
        handle_error(err)
    })
}