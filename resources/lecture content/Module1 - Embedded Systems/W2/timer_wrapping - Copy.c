// Simple C program to illustrate timer wrapping

// for data types:
#include <stdint.h>
// for debug outout:
#include <stdio.h>


// main function to show wrapping management
int main()
{
    // variables to store start and stop time in 16 bit unsigned int
    uint16_t  start;
    uint16_t  end;
    uint32_t  elapsed;
    // prints hello world
    printf("Counter example\n");

    printf("Simple no wrapping support:\n");
    start   = 0;
    end     = 1000;
    elapsed = end-start;
    printf(" no wrap:  %d\n", elapsed);

    start   = 65530;
    end     = 994;
    elapsed = end-start;
    printf(" wrap:     %d\n", elapsed);

    printf("Wrapping support:\n");

    start   = 0;
    end     = 1000;
    elapsed = (uint32_t)(0x10000 + end - start)&0xFFFF;
    printf(" no wrap:  %d\n", elapsed);

    start   = 65530;
    end     = 994;
    elapsed = (uint32_t)(0x10000 + end - start)&0xFFFF;
    printf(" wrap:     %d\n", elapsed);


    return 0;
}
