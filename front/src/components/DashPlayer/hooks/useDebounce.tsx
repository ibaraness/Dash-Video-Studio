import { useRef } from "react";

const useDebounce = () => {
    // here debounceSeed is defined to keep track of the setTimout function
    const debounceSeed = useRef<number | null>(null);
    // a fucntion is created via useRef which
    // takes a function and a delay (in milliseconds) as an argument
    // which has a defalut value set to 200 , can be specified as per need
    const debounceFunction = useRef((func: Function, timeout = 200) => {
     // checks if previosus timeout is present then it will clrear it
      if (debounceSeed.current) {
        clearTimeout(debounceSeed.current);
        debounceSeed.current = null;
      }
     // creates a timeout function witht he new fucntion call
      debounceSeed.current = setTimeout(() => {
        func();
      }, timeout);
    });
    // a debounce function is returned
    return debounceFunction.current;
  };
  
  export default useDebounce;