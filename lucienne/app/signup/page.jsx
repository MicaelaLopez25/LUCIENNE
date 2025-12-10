"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import "./page-signup.css"

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Aquí se eliminó la comprobación de confirmPassword

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      // Enviamos solo name, email y password, como requiere tu modelo
      body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    // Login automático
    await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    router.push("/"); // Redirigir a Home
  };

  return (
    // Contenedor principal para la estructura de la página
    <div className="page-wrapper"> 
        {/* Barra roja superior (estilizada con CSS) */}
        <div className="top-header-red"></div> 
        
        <div className="signup-container">
            
            {/* Rastro de migas de pan (Breadcrumbs) */}
            <p className="breadcrumbs">Inicio &gt; Mi cuenta &gt; Crear cuenta</p> 

            <h2>Crear cuenta</h2>

            <form onSubmit={handleSubmit}>
                
                {/* Nombre y apellido */}
                <label className="form-group-label">Nombre y apellido</label>
                <input
                    type="text"
                    name="name"
                    placeholder="ej: Maria Torres"
                    onChange={handleChange}
                    required
                />
                
                {/* Email */}
                <label className="form-group-label">Email</label>
                <input
                    type="email"
                    name="email"
                    placeholder="ej: tunombre@gmail.com"
                    onChange={handleChange}
                    required
                />
                
                {/* Contraseña */}
                <label className="form-group-label">Contraseña</label>
                <input
                    type="password"
                    name="password"
                    placeholder=""
                    onChange={handleChange}
                    required
                />
                
                {/* *** EL CAMPO 'TELÉFONO' Y 'CONFIRMAR CONTRASEÑA' FUE ELIMINADO *** */}

                {error && <p className="error">{error}</p>}

                <button type="submit">Registrarme</button>
            </form>
        </div>
    </div>
  );
}