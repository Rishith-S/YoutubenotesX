
export default function InputField({idFor,placeholder}:{idFor:string,placeholder:string}) {
  return (
    <div className="relative">
      <input
        id={idFor}
        className="peer w-full h-12 items-center bg-transparent text-white text-lg px-4 border border-orange-400 rounded-md transition duration-300 ease focus:outline-none"
      />
      <label
        htmlFor={idFor}
        className="absolute cursor-text bg-black px-2 left-3 top-3.5 text-white text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:text-xs"
      >
        {placeholder} *
      </label>
    </div>
  );
}
