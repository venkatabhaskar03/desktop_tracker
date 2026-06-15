export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-4 border-[#012576] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
