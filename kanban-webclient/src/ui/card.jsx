export function Card({ children, className = "" }) {
    return <div className={`p-4 border rounded-lg shadow bg-white ${className}`}>{children}</div>;
  }
  
  export function CardContent({ children, className = "" }) {
    return <div className={`p-2 ${className}`}>{children}</div>;
  }
  