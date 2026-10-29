/**
 * Class bantu buat mode "collapsed" (cuma icon). Dipasang lewat data-collapsed di <aside>,
 * jadi server & client render hasil yang sama (nggak ada kedip), dan cuma berlaku di desktop (md+).
 * Tulis lengkap (jangan digabung string) biar kebaca sama Tailwind.
 */
export const HIDE_WHEN_COLLAPSED =
  "group-data-[collapsed=true]/sidebar:md:hidden";

export const SHOW_WHEN_COLLAPSED =
  "hidden group-data-[collapsed=true]/sidebar:md:block";

export const CENTER_WHEN_COLLAPSED =
  "group-data-[collapsed=true]/sidebar:md:justify-center group-data-[collapsed=true]/sidebar:md:px-0";
