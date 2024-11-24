document.addEventListener('DOMContentLoaded', () => {
    const tabBlocks = document.querySelectorAll(".tab-block");


    tabBlocks.forEach((tabBlock, index) => {
        const tabs = tabBlock.querySelectorAll('.wp-block-tableberg-table') as NodeListOf<HTMLElement>;
        const headings = tabBlock.querySelectorAll(".tab-heading");

        tabs.forEach((tab) => {
            tab.style.display = "none";
        });

        tabs[0].style.display = "block";
        headings[0].classList.add("active");

        headings.forEach((heading, index) => {
            heading.addEventListener('click', () => {

                tabs.forEach(tab => {
                    tab.style.display = "none"
                });

                tabs[index].style.display = "block";


                headings.forEach(heading => {
                    heading.classList.remove('active');
                })
                heading.classList.add("active");

            })
        })
    })


})
