module m1(finput fi1,fi2,fi3, cinput ci1, foutput fo1);     
	fchannel fc1,fc2;
	assign fc1 = fi1 + fi2;  
	assign fc2 = fi3 / ci1;
	assign fo1 = fc1 + fc2;	
endmodule