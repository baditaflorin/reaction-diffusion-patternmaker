export type ToastMessage = {
  id: string;
  kind: "success" | "error" | "info";
  text: string;
};

export function ToastRail({ messages }: { messages: ToastMessage[] }) {
  return (
    <div aria-live="polite" className="toast-rail">
      {messages.map((message) => (
        <div className={`toast toast-${message.kind}`} key={message.id}>
          {message.text}
        </div>
      ))}
    </div>
  );
}
