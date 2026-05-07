export {};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            callback: (response: GoogleCredentialResponse) => void;
            client_id: string;
            ux_mode?: "popup" | "redirect";
          }) => void;
          prompt: () => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              locale?: string;
              logo_alignment?: "left" | "center";
              shape?: "rectangular" | "pill" | "circle" | "square";
              size?: "small" | "medium" | "large";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              theme?: "outline" | "filled_blue" | "filled_black";
              type?: "standard" | "icon";
              width?: string;
            },
          ) => void;
        };
      };
    };
  }

  interface GoogleCredentialResponse {
    credential: string;
    select_by?: string;
  }
}
