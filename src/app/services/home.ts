//  loadMore(category) {
//       if (
//           this.allProductsLoaded ||
//           this.allBestSellingLoaded ||
//           this.allFlashSalesLoaded
//       ) {
//           switch (category) {
//               case 'products':
//                   this.products$ = this.loadingS.showLoadingUntilCompleted(
//                       this.productsService.productsAllItems().pipe(
//                           concatMap((all) => {
//                               return this.productsService
//                                   .getProducts(false)
//                                   .pipe(
//                                       map((paginated) => {
//                                           let { loaded, paginatedProducts } =
//                                               mapToPaginatedProducts(
//                                                   paginated,
//                                                   all,
//                                                   this.allProductsLoaded
//                                               );
//                                           this.allProductsLoaded = loaded;
//                                           return paginatedProducts;
//                                       })
//                                   );
//                           })
//                       )
//                   );
//                   break;
//               case 'bestSelling':
//                   this.bestSelling$ = this.loadingS.showLoadingUntilCompleted(
//                       this.productsService.bestSellingAllItems().pipe(
//                           concatMap((all) => {
//                               return this.productsService
//                                   .bestSelling(false)
//                                   .pipe(
//                                       map((paginated) => {
//                                           let { loaded, paginatedProducts } =
//                                               mapToPaginatedProducts(
//                                                   paginated,
//                                                   all,
//                                                   this.allBestSellingLoaded
//                                               );
//                                           this.allBestSellingLoaded = loaded;
//                                           return paginatedProducts;
//                                       })
//                                   );
//                           })
//                       )
//                   );
//                   break;
//               case 'flashSales':
//                   this.flashSales$ = this.loadingS.showLoadingUntilCompleted(
//                       this.productsService.flashSalesAllItems().pipe(
//                           concatMap((all) => {
//                               return this.productsService
//                                   .getFlashSales(false)
//                                   .pipe(
//                                       map((paginated) => {
//                                           let { loaded, paginatedProducts } =
//                                               mapToPaginatedProducts(
//                                                   paginated,
//                                                   all,
//                                                   this.allFlashSalesLoaded
//                                               );
//                                           this.allFlashSalesLoaded = loaded;
//                                           return paginatedProducts;
//                                       })
//                                   );
//                           })
//                       )
//                   );
//                   break;
//           }
//       } else if (
//           !this.allProductsLoaded ||
//           !this.allBestSellingLoaded ||
//           !this.allFlashSalesLoaded
//       ) {
//           switch (category) {
//               case 'products':
//                   this.products$ = this.loadingS.showLoadingUntilCompleted(
//                       this.productsService.productsAllItems().pipe(
//                           concatMap((all) => {
//                               return this.productsService
//                                   .getProducts(true)
//                                   .pipe(
//                                       map((paginated) => {
//                                           let { loaded, paginatedProducts } =
//                                               mapToPaginatedProducts(
//                                                   paginated,
//                                                   all,
//                                                   this.allProductsLoaded
//                                               );
//                                           this.allProductsLoaded = loaded;
//                                           return paginatedProducts;
//                                       })
//                                   );
//                           })
//                       )
//                   );
//                   break;
//               case 'bestSelling':
//                   this.bestSelling$ = this.loadingS.showLoadingUntilCompleted(
//                       this.productsService.bestSellingAllItems().pipe(
//                           concatMap((all) => {
//                               return this.productsService
//                                   .bestSelling(true)
//                                   .pipe(
//                                       map((paginated) => {
//                                           let { loaded, paginatedProducts } =
//                                               mapToPaginatedProducts(
//                                                   paginated,
//                                                   all,
//                                                   this.allBestSellingLoaded
//                                               );
//                                           this.allBestSellingLoaded = loaded;
//                                           return paginatedProducts;
//                                       })
//                                   );
//                           })
//                       )
//                   );
//                   break;
//               case 'flashSales':
//                   this.flashSales$ = this.loadingS.showLoadingUntilCompleted(
//                       this.productsService.flashSalesAllItems().pipe(
//                           concatMap((all) => {
//                               return this.productsService
//                                   .getFlashSales(true)
//                                   .pipe(
//                                       map((paginated) => {
//                                           let { loaded, paginatedProducts } =
//                                               mapToPaginatedProducts(
//                                                   paginated,
//                                                   all,
//                                                   this.allFlashSalesLoaded
//                                               );
//                                           this.allFlashSalesLoaded = loaded;
//                                           return paginatedProducts;
//                                       })
//                                   );
//                           })
//                       )
//                   );
//                   break;
//           }
//       }
//   }
