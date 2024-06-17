"use client";
import { useFormStatus } from "react-dom";

interface FormButtonProps {
    text: string;
  }
  
  //hook으로 form의 로딩상태 알기 -> loading 삭제
  export default function FormButton({ text }: FormButtonProps) {
    const{pending} = useFormStatus();
    //pending상태라면 버튼 비활성화 
    return (
      <button
        disabled={pending}
        className="primary-btn h-10 disabled:bg-neutral-400  disabled:text-neutral-300 disabled:cursor-not-allowed"
      >
        {pending ? "로딩 중" : text}
      </button>
    );
  }