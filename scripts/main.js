/*
    * Autor: Roberto Rico Sandoval.
    * Fille: Creación de una sala de chat.
    * Date: 08/ 07/ 2023
*/


function Chat() {
    
    this.listaMensajes = document.getElementById('messages');

    this.formMensaje = document.getElementById('message-form');

    this.mensajeUsuario = document.getElementById('message');

    this.botonEnviar = document.getElementById('submit');

    this.nombreUsuario = document.getElementById('user-name');

    // Botones para iniciar sesión con el metodo de autenticación.
    this.botonIngresar = document.getElementById('sign-in');

    this.botonSalir = document.getElementById('sign-out');

    this.IngresoSnackbar = document.getElementById('must-signin-snackbar');

    this.formMensaje.addEventListener('submit', this.guardarMensaje.bind(this));

    this.botonSalir.addEventListener('click', this.Salir.bind(this));

    this.botonIngresar.addEventListener('click', this.Ingresar.bind(this));

    var botonActivacion = this.activarBoton.bind(this);

    this.mensajeUsuario.addEventListener('keyup', botonActivacion);

    this.mensajeUsuario.addEventListener('change', botonActivacion);

    this.iniciarFirebase();

}
    

Chat.prototype.iniciarFirebase = function() {

    this.auth = firebase.auth();

    // Lectura de la base de datos en tiempo real.
    this.database = firebase.database();
    this.auth.onAuthStateChanged(this.cambioEstadoAutenticacion.bind(this));

};


Chat.prototype.cargarMensajes = function() {

    this.messagesRef = this.database.ref('messages');
    this.messagesRef.off();

    var configMensaje = function(data) {

        var val = data.val();
        this.mostrarMensaje(data.key, val.name, val.text);

    }.bind(this);

    this.messagesRef.limitToLast(12).on('child_added', configMensaje);
    this.messagesRef.limitToLast(12).on('child_changed', configMensaje);

};


Chat.prototype.guardarMensaje = function(e) {

    e.preventDefault();

    if (this.mensajeUsuario.value && this.haIngresado()) {

        var currentUser = this.auth.currentUser;
        this.messagesRef.push({

            name: currentUser.displayName,
            text: this.mensajeUsuario.value

        }).then(function() {

            Chat.reiniciarMaterialTextfield(this.mensajeUsuario);
            this.activarBoton();

        }.bind(this)).catch(function(error) {

            console.error('Error writing new message to Firebase Database', error);

        });
    }
};


Chat.prototype.Ingresar = function() {

    var provider = new firebase.auth.GoogleAuthProvider();
    this.auth.signInWithPopup(provider);

};
    

Chat.prototype.Salir = function() {

    this.auth.signOut();
};


Chat.prototype.cambioEstadoAutenticacion = function(user) {
    
    if (user) {

        var userName = user.displayName;

        this.nombreUsuario.textContent = userName;
        this.nombreUsuario.removeAttribute('hidden');
        this.botonSalir.removeAttribute('hidden');
        this.botonIngresar.setAttribute('hidden', 'true');
        this.cargarMensajes();

    } else {

        this.nombreUsuario.setAttribute('hidden', 'true');
        this.botonSalir.setAttribute('hidden', 'true');
        this.botonIngresar.removeAttribute('hidden');

    }
};
   

Chat.prototype.haIngresado = function() {

    if (this.auth.currentUser) {

        return true;

    };

    var data = {

        message: 'Inicia sesión para usar el chat',
        timeout: 2000

    };

        this.IngresoSnackbar.MaterialSnackbar.showSnackbar(data);
        return false;
        
};


Chat.reiniciarMaterialTextfield = function(element) {

    element.value = '';
    element.parentNode.MaterialTextfield.boundUpdateClassesHandler();

};


Chat.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
    '<div class="message"></div>' +
    '<div class="name"></div>' +
    '</div>';


Chat.prototype.mostrarMensaje = function(key, name, text) {

    var div = document.getElementById(key);

    if (!div) {

        var container = document.createElement('div');
        container.innerHTML = Chat.MESSAGE_TEMPLATE;
        div = container.firstChild;
        div.setAttribute('id', key);
        this.listaMensajes.appendChild(div);

    }

    div.querySelector('.name').textContent = name;
    var messageElement = div.querySelector('.message');

    if (text) {
    
        messageElement.textContent = text;
        messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');

    }

    setTimeout(function() {div.classList.add('visible')}, 1);

    this.listaMensajes.scrollTop = this.listaMensajes.scrollHeight;
    this.mensajeUsuario.focus();

};


Chat.prototype.activarBoton = function() {

    if (this.mensajeUsuario.value) {

        this.botonEnviar.removeAttribute('disabled');

    } else {

        this.botonEnviar.setAttribute('disabled', 'true');

    }
};


window.onload = function() {

    window.chat = new Chat();
    
};

