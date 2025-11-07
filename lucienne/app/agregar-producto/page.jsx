  "use client";

  import { useState, useRef } from "react";

  import { useRouter } from "next/navigation";

  import { X, Loader2, Camera, Plus, Trash2 } from "lucide-react";

  import "./agregar-producto.css";

  export default function AddProductPage() {
    const router = useRouter();

    const fileInputRef = useRef(null);

    // Nuevo estado para rastrear qué variante está cargando una imagen actualmente

    const [activeVariantId, setActiveVariantId] = useState(null);

    // El estado ahora incluye el campo 'image' dentro de cada variante

    const [formData, setFormData] = useState({
      title: "",

      price: "",

      // 'image' global eliminado

      variants: [
        {
          id: Date.now(),

          color: "",

          stock: "",

          image: "", // Cadena Base64 específica para esta variante
        },
      ],
    });

    // 'imagePreview' global eliminado

    const [loading, setLoading] = useState(false);

    const [status, setStatus] = useState({ message: "", type: "" });

    // Función de ayuda para generar un ID temporal único

    const newVariantId = () => Date.now() + Math.random();

    // --- MANTENIMIENTO DEL ESTADO ---

    const handleChange = (e) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,

        [name]: value,
      }));
    };

    // Función para disparar el input de archivo y registrar qué variante se está editando

    const handleImageClick = (variantId) => {
      setActiveVariantId(variantId);

      fileInputRef.current.click();
    };

    // Esta función ahora usa 'activeVariantId' para actualizar la variante correcta

    const handleImageUpload = (event) => {
      const file = event.target.files[0];

      // Limpiamos el valor del input para que el mismo archivo pueda ser seleccionado de nuevo si es necesario

      event.target.value = "";

      if (!file || !file.type.startsWith("image/")) {
        if (file) {
          setStatus({
            message: "Por favor, selecciona un archivo de imagen válido.",

            type: "error",
          });
        }

        setActiveVariantId(null);

        return;
      }

      if (activeVariantId === null) {
        setStatus({
          message: "Error interno: ID de variante no encontrado para la carga.",

          type: "error",
        });

        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        // Actualiza el campo 'image' Base64 DENTRO de la variante activa

        setFormData((prev) => ({
          ...prev,

          variants: prev.variants.map((v) =>
            v.id === activeVariantId ? { ...v, image: reader.result } : v
          ),
        }));

        setStatus({ message: "", type: "" });

        setActiveVariantId(null); // Resetea el ID activo
      };

      reader.readAsDataURL(file);
    };

    // Maneja el cambio de valores dentro de un campo de variante

    const handleVariantChange = (id, e) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,

        variants: prev.variants.map((v) =>
          v.id === id ? { ...v, [name]: value } : v
        ),
      }));
    };

    // Agrega un nuevo campo de variante (Color, Stock e Imagen)

    const addVariant = () => {
      setFormData((prev) => ({
        ...prev,

        variants: [
          ...prev.variants,

          { id: newVariantId(), color: "", stock: "", image: "" },
        ],
      }));
    };

    // Elimina un campo de variante

    const removeVariant = (id) => {
      // Siempre debe quedar al menos una variante

      if (formData.variants.length > 1) {
        setFormData((prev) => ({
          ...prev,

          variants: prev.variants.filter((v) => v.id !== id),
        }));
      }
    };

    // --- VALIDACIÓN Y ENVÍO ---

    const validateForm = () => {
      const errors = [];

      // 1. Validación de campos base obligatorios

      if (!formData.title.trim()) errors.push("Título");

      if (
        !formData.price ||
        isNaN(parseFloat(formData.price)) ||
        parseFloat(formData.price) <= 0
      )
        errors.push("Precio (debe ser un valor numérico positivo)");

      // 2. Validación de variantes obligatorias y reglas numéricas

      let variantErrors = [];

      formData.variants.forEach((v, index) => {
        if (!v.image.trim()) {
          // <-- VALIDACIÓN DE IMAGEN POR VARIANTE

          variantErrors.push(`Imagen de la variante ${index + 1}`);
        }

        if (!v.color.trim()) {
          variantErrors.push(`Color de la variante ${index + 1}`);
        }

        const stockValue = parseInt(v.stock);

        // Debe ser un número, no negativo, y no puede estar vacío (v.stock === "")

        if (v.stock === "" || isNaN(stockValue) || stockValue < 0) {
          variantErrors.push(
            `Stock de la variante ${
              index + 1
            } (debe ser un número entero no negativo)`
          );
        }
      });

      if (variantErrors.length > 0) {
        errors.push("Variantes (revisa Imagen, Color y Stock)");
      }

      if (errors.length > 0) {
        setStatus({
          message: `Faltan campos obligatorios o son inválidos: ${errors.join(
            ", "
          )}.`,

          type: "error",
        });

        return false;
      }

      return true;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      setLoading(true);

      setStatus({ message: "Guardando productos...", type: "" });

      const successfulPosts = [];

      const failedPosts = [];

      // Iteramos sobre CADA variante y enviamos una llamada POST individual

      for (const variant of formData.variants) {
        try {
          const response = await fetch("/api/products", {
            method: "POST",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({
              // Datos base del producto

              title: formData.title,

              price: parseFloat(formData.price),

              // Datos específicos de la variante

              color: variant.color,

              stock: parseInt(variant.stock) || 0,

              image: variant.image, // <<-- La imagen ahora es la de la variante
            }),
          });

          if (response.ok) {
            successfulPosts.push(variant.color);
          } else {
            failedPosts.push(variant.color);
          }
        } catch (error) {
          console.error("Error de red al enviar variante:", variant.color, error);

          failedPosts.push(variant.color);
        }
      }

      setLoading(false);

      if (failedPosts.length === 0) {
        setStatus({
          message: `¡${successfulPosts.length} Producto(s) agregado(s) con éxito! Redirigiendo...`,

          type: "success",
        });

        setTimeout(() => router.push("/productos"), 1500);
      } else {
        setStatus({
          message: `Se agregaron ${
            successfulPosts.length
          } productos. Falló el guardado para: ${failedPosts.join(", ")}.`,

          type: "error",
        });
      }
    };

    return (
      <div className="form-page-container">
        <div className="add-product-card">
          {/* Encabezado */}

          <div className="form-header">
            <button
              onClick={() => router.back()}
              className="close-btn"
              aria-label="Volver atrás"
            >
              <X size={28} strokeWidth={3} />
            </button>

            <h1 className="form-title">AGREGAR PRODUCTO BASE</h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Input de archivo oculto (Único) */}

            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload} // Llama al handler que sabe qué variante actualizar
              className="hidden-file-input"
            />

            {/* Campo de Título (Base) */}

            <div className="form-control">
              <label htmlFor="title" className="input-label">
                Título del Producto
              </label>

              <div className="input-group">
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="ej: Campera de Lona"
                  className="text-input"
                  required
                />
              </div>
            </div>

            {/* Campo de Precio (Base) */}

            <div className="form-control">
              <label htmlFor="price" className="input-label">
                Precio Base (por unidad)
              </label>

              <div className="input-group">
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="ej: 12500"
                  className="text-input"
                  required
                />
              </div>
            </div>

            {/* SECCIÓN DE VARIANTES */}

            <h2 className="variants-title">
              VARIACIONES (Imagen, Color & Stock)
            </h2>

            <p className="variants-subtitle">
              Define el stock y sube una foto por cada color.
            </p>

            {formData.variants.map((v, index) => (
              <div key={v.id} className="variant-row">
                {/* 1. Placeholder de Imagen Específico de la variante */}

                <div
                  className="image-placeholder variant-image-placeholder"
                  onClick={() => handleImageClick(v.id)}
                  aria-label={`Toca para subir la imagen de la variante ${
                    v.color || index + 1
                  }`}
                >
                  {v.image ? (
                    <img
                      src={v.image}
                      alt={`Previsualización ${v.color}`}
                      className="uploaded-image-preview"
                    />
                  ) : (
                    <div className="upload-prompt variant-prompt">
                      <Camera size={20} strokeWidth={2} />

                      <span>{`Imagen ${index + 1}`}</span>
                    </div>
                  )}
                </div>

                {/* Contenedor de campos de texto */}

                <div className="variant-fields-container">
                  {/* Campo de Color */}

                  <div className="variant-field">
                    <label htmlFor={`color-${v.id}`} className="variant-label">
                      Color
                    </label>

                    <div className="input-group">
                      <input
                        id={`color-${v.id}`}
                        name="color"
                        type="text"
                        value={v.color}
                        onChange={(e) => handleVariantChange(v.id, e)}
                        placeholder="ej: Rojo"
                        className="text-input"
                        required
                      />
                    </div>
                  </div>

                  {/* Campo de Stock */}

                  <div className="variant-field">
                    <label htmlFor={`stock-${v.id}`} className="variant-label">
                      Stock
                    </label>

                    <div className="input-group">
                      <input
                        id={`stock-${v.id}`}
                        name="stock"
                        type="number"
                        value={v.stock}
                        onChange={(e) => handleVariantChange(v.id, e)}
                        placeholder="ej: 5"
                        min="0"
                        className="text-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Botón de eliminar (si hay más de 1) */}

                {formData.variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(v.id)}
                    className="remove-variant-btn"
                    aria-label="Eliminar variante"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}

            {/* Botón para añadir más variantes */}

            <button
              type="button"
              onClick={addVariant}
              className="add-variant-btn"
            >
              <Plus size={18} className="mr-2" />
              Añadir otra Variante
            </button>

            {/* Mensaje de estado (éxito/error) */}

            {status.message && (
              <div className={`status-message ${status.type}`}>
                {status.message}
              </div>
            )}

            {/* Botón de Envío */}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Guardando Variantes...
                </span>
              ) : (
                "GUARDAR PRODUCTO Y VARIANTES"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }
