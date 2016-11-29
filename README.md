#Suord
![Icon](https://github.com/Positive07/Suord/raw/master/src/image/icon.png)

[![Build Status](https://travis-ci.org/Positive07/Suord.svg?branch=master)](https://travis-ci.org/Positive07/Suord) [![Build status](https://ci.appveyor.com/api/projects/status/t0l7gvnrengiw1va?svg=true)](https://ci.appveyor.com/project/Positive07/suord)
- - -

Este programa es desarrollado para una organizacion privada.

El objetivo es tener un software el cual corre localmente, al cual solo se puede acceder con verificacion por contraseña.

El mismo, permite al operario ingresar facilmente la tarea que se encuentra realizando alguno de los operarios moviles, asi como tambien notificar al gerente sobre problemas, tanto con los operarios o las tareas.

Asi mismo el software permite al gerente actualizar las tareas, asi como tambien sus operarios en el caso de nuevos contratos o despidos.

## Desarrollo
Este software sera desarrollado con Electron, el cual permite usar tecnologias Web de manera local.

Como lenguaje se seleccionó Elm, el cual es compilado a JavaScript, este provee ventajas como el control sobre el tipo de variables, variables inmutables, unica fuente de verdad y demas.

Para el diseño se utiliza SCSS el cual se compila a CSS, por la facilidad de programarlo.

Para compilar se usan un par de tareas de Gulp.

En cuanto a la verificacion de usuarios esto se hará mediante las API de WebCrypto.

Para la sincronizacion y back-up de inforacion se utilizará una carpeta de Google Drive, la cual facilita el desarrollo y brinda mayor seguridad al sistema.

## Probar

Para probar es necesario descargar el repositorio, para esto Git debe estar instalado, y en una consola de comandos se debe ejecutar:
```Shell
git clone git@github.com:Positive07/Suord.git
cd Suord
```

Posteriormente con Node.js instalado se debe correr los siguientes comandos:
```Shell
npm install gulp-cli -g
npm install electron -g
npm install
```

Finalmente para iniciar la aplicacion:
```Shell
gulp
```

## Licencia
Aunque el software se desarrolla para una empresa privada, el codigo, como referencia esta bajo la licencia MIT.

Esto quiere decir que es posible modificar, redistribuir e incluso comercializar copias parciales del software.
Dando credito a sus autores y marcando claramente que no se trata del software original.
Siempre y cuando no se emplee la totalidad del codigo, lo cual implica una copia ilicita del programa desarrollado.
