/**
 * @author TheF0x0
 * @since 06/04/2023
 */

setInterval(update_page, 250)

const get_address = () => document.getElementById('address').value
const make_address = (endpoint) => `https://${get_address()}/${endpoint}`

async function make_request(method, endpoint, data) {
    return fetch(make_address(endpoint), {method: method, ...data})
        .then(res => res.json())
        .catch(err => console.error(`Could not fulfill request: ${err}`))
}

function update_state() {
    make_request('GET', 'getstate').then(state => {
        document.getElementById('power-state').innerHTML = state['is_on']
            ? '<b class="power-state-active">Device is active</b>'
            : '<b class="power-state-idle">Device is idle</b>'
        document.getElementById('target-speed').innerText = `Target Speed: ${state['target_speed']}`
        document.getElementById('actual-speed').innerText = `Actual Speed: ${state['actual_speed']}`
    })
}

function update_page() {
    update_state()
}