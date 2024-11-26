
// frontend/src/components/shared/Error.jsx
export const Error = ({ message }) => (
    <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
      <p>{message}</p>
    </div>
  );