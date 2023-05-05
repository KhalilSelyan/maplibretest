import dynamic from "next/dynamic";
// import Jotai from "~/components/jotai";

const Test = dynamic(() => import("../components/foxglovebridge"), {
  ssr: false,
});
// const Jotai = dynamic(() => import("../components/jotai"), {
//   ssr: false,
// });

const Main = () => {
  return (
    <div>
      <Test />
    </div>
  );
};

export default Main;
