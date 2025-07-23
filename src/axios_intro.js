import axios from 'axios';

// Ejemplo de función para realizar una petición GET
async function obtenerDatos() {
    // Realiza una petición GET a una URL
    const respuesta = await axios.get('https://jsonplaceholder.typicode.com/posts/1');
    // Muestra los datos recibidos en consola
    console.log(respuesta.data);
}

// Ejemplo de función para realizar una petición POST
async function enviarDatos() {
    // Crea un objeto con los datos a enviar
    const datos = {
        title: 'foo',
        body: 'bar',
        userId: 1
    };
    // Realiza una petición POST enviando el objeto como cuerpo
    const respuesta = await axios.post('https://jsonplaceholder.typicode.com/posts', datos);
    // Muestra la respuesta recibida en consola
    console.log(respuesta.data);
}

// Ejemplo de uso de una instancia de axios con baseURL
const api = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    // Puedes agregar aquí otros parámetros por defecto, como headers
});

async function obtenerPostConInstancia() {
    // Utiliza la instancia para hacer una petición GET relativa al baseURL
    const respuesta = await api.get('/posts/2');
    console.log(respuesta.data);
}
