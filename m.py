import os
import subprocess
import tkinter as tk
from tkinter import simpledialog, messagebox
import platform

def ejecutar_comando(comando):
    """Ejecuta un comando en la terminal y captura errores."""
    try:
        # Ejecuta el comando de forma silenciosa
        resultado = subprocess.run(
            comando, 
            check=True, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE, 
            text=True
        )
        return resultado.stdout
    except subprocess.CalledProcessError as e:
        messagebox.showerror("Error de Git", f"Falló al ejecutar: {' '.join(comando)}\n\n{e.stderr}")
        return None

def main():
    # Ocultar la ventana principal de tkinter (solo queremos los pop-ups)
    root = tk.Tk()
    root.withdraw()

    # 1. Validar que estamos dentro de un repositorio Git
    if ejecutar_comando(["git", "rev-parse", "--is-inside-work-tree"]) is None:
        messagebox.showerror("Error", "Este directorio no es un repositorio Git.")
        return

    # 2. Pedir el mensaje del commit mediante una ventana emergente
    mensaje_commit = simpledialog.askstring("Auto Git Deploy", "¿Qué cambios hiciste? (Mensaje del commit):")

    # Si el usuario cancela o deja vacío, abortamos
    if not mensaje_commit:
        messagebox.showwarning("Cancelado", "Operación cancelada. Se requiere un mensaje para el commit.")
        return

    # 3. Secuencia mágica de Git
    if ejecutar_comando(["git", "add", "."]) is None: return
    if ejecutar_comando(["git", "commit", "-m", mensaje_commit]) is None: return
    if ejecutar_comando(["git", "push"]) is None: return

    # 4. Lanzar mensaje de éxito
    messagebox.showinfo("¡Publicado!", "El código se ha subido con éxito al servidor.\n\nEl repositorio está actualizado.")

    # 5. Mostrar la imagen de victoria (Ej. un gato hacker naranja)
    # Cambia este nombre por el archivo de imagen que quieras usar
    ruta_imagen = "oliver_hacker.png" 
    
    if os.path.exists(ruta_imagen):
        # Abre la imagen con el visor predeterminado del sistema operativo
        sistema = platform.system()
        if sistema == 'Darwin':       # macOS
            subprocess.call(('open', ruta_imagen))
        elif sistema == 'Windows':    # Windows
            os.startfile(ruta_imagen)
        else:                         # Linux / Otros
            subprocess.call(('xdg-open', ruta_imagen))
    else:
        # Si no encuentra la imagen, te avisa sutilmente por consola
        print(f"Deploy exitoso. (Nota: Coloca una imagen llamada '{ruta_imagen}' en esta carpeta para verla al terminar).")

if __name__ == "__main__":
    main()