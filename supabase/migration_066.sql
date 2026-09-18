-- Evento de cumpleaños: cada cuenta guarda su propia fecha de nacimiento
-- (la captura el alumno en Ajustes, nunca el admin) para detectar "hoy es
-- tu cumpleaños" y desbloquear el mensaje + regalo + fiesta en el Campus VR.
-- Sin política RLS nueva: "profiles: update own" ya permite que cada quien
-- edite su propia fila.
alter table public.profiles add column if not exists birthdate date;
