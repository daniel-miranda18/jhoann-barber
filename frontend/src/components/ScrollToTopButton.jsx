import { useEffect, useState } from "react";
import { Fab } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

export default function ScrollToTopButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!show) return null;

  return (
    <Fab
      color="primary"
      aria-label="scroll to top"
      onClick={scrollToTop}
      sx={{
        position: "fixed",
        right: 20,
        bottom: 80,
        zIndex: 1300,
      }}
    >
      <KeyboardArrowUpIcon />
    </Fab>
  );
}
