import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import DOMPurify from "dompurify";
import PropTypes from 'prop-types';

export const CustomAccordion = ({ title, content }) => {
  return (
    <Accordion allowMultiple className="mobile:w-full lg:w-[500px] xl:w-[625px]">
      <AccordionItem>
        {({ isExpanded }) => (
          <>
            <h2>
              <AccordionButton className="flex justify-between py-[16px]"
              style={{borderBottom: isExpanded ? "none" : "1px solid rgba(112,112,112,1)"}}
              >
                <Box as="span" textAlign="left" className="mobile:text-[14px] lg:text-[20px] text-[#2A534F]">
                  {title}
                </Box>                               
                <ChevronDownIcon className={`w-[24px] h-[24px]`}  style={{transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)"}}/>
              </AccordionButton>
            </h2>
            <AccordionPanel className="faq_accordion_panel mobile:w-full lg:w-[625px]  pl-[16px] pb-[16px] text-[#2A534F]"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            style={{borderBottom: !isExpanded ? "none" : "1px solid rgba(112,112,112,1)",fontSize: "16px !important"}}
            >
              
            </AccordionPanel>
          </>
        )}
      </AccordionItem>
    </Accordion>
  );
};

CustomAccordion.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired
};
