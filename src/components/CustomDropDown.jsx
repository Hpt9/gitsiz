import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

export function CustomDropDown({ name, options, isLanguage = false }) {
  return (
    <Menu as="div" className="relative inline-block text-left bottom-[1px]">
      {({ open }) => (
        <>
          <div>
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 pb-[6px] pt-2 text-sm text-gray-900">
              <span className="text-white text-[14px]">{name}</span>
              <ChevronDownIcon
                aria-hidden="true"
                className={`-mr-1 size-5 text-gray-400 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </MenuButton>
          </div>
          <AnimatePresence>
            {open && (
              <MenuItems
                as={motion.div}
                static
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className={`absolute right-0 z-10 mt-2 ${
                  isLanguage ? "w-[80px]" : "w-[172px]"
                } origin-top-right rounded-md ring-1 shadow-lg ring-black/5`}
              >
                <div className="bg-[rgba(55,93,89,255)]">
                  {options.map((option, index) => (
                    <MenuItem
                      key={index}
                      className="hover:bg-[rgba(73,108,104,255)]"
                    >
                      {isLanguage ? (
                        <div className="flex items-center gap-2 px-4 py-[5px]">
                          <img src={option.image} alt={option.name} className="w-5 h-5" />
                          <span className="text-white text-xs">{option.name}</span>
                        </div>
                      ) : (
                        <a
                          href={option.link}
                          className="block text-white px-4 py-[5px] text-xs data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                        >
                          {option.name}
                        </a>
                      )}
                    </MenuItem>
                  ))}
                </div>
              </MenuItems>
            )}
          </AnimatePresence>
        </>
      )}
    </Menu>
  );
}

CustomDropDown.propTypes = {
  name: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      ...(props => props.isLanguage ? {
        image: PropTypes.string.isRequired,
        code: PropTypes.string.isRequired
      } : {
        link: PropTypes.string.isRequired
      })
    }).isRequired
  ).isRequired,
  isLanguage: PropTypes.bool,
};
