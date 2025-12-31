export default function InputField({idFor,placeholder,value,onChange}:{idFor:string,placeholder:string,value:string,onChange:any}) {
  return (
    <div className="relative">
      <div className="w-full h-12 p-[1px] bg-gradient-to-br from-orange-500 via-neutral-800 to-neutral-800 shadow-lg rounded-md">
        <input
          id={idFor}
          value={value}
          onChange={onChange}
          className="peer w-full h-full items-center bg-black text-white text-lg p-2 rounded-md transition duration-300 ease focus:outline-none"
        />
        <label
          htmlFor={idFor}
          className={`absolute cursor-text bg-black px-2 left-3 top-3.5 text-white text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:text-xs ${value.length > 0 ? "-top-2 text-xs" : "text-sm"}`}       
        >
          {placeholder} *
        </label>
      </div>
    </div>
  );
}
